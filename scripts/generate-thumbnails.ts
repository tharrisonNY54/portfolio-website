/**
 * One-time thumbnail generation driven by the website's content.
 *
 * Discovers all projects/sessions from the site's content, picks the first video
 * per session (and per project), and saves thumbnail.jpg to your computer in
 * thumbnails-output/ (no upload). Uses FFmpeg if available; otherwise downloads
 * the start of each video and uses FFmpeg on the temp file.
 *
 * Run from scannedreality-website: npm run generate-thumbnails
 * Requires: FFmpeg on PATH (install from https://ffmpeg.org or: choco install ffmpeg)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  loadAllProjects,
  loadProjectSessions,
  loadSessionTakes,
  type Take,
} from '../lib/content-loader';

const SEEK_TIME = '00:00:05';
const OUT_DIR = path.join(process.cwd(), 'thumbnails-output');
/** Bytes to download when FFmpeg can't read URL directly (~15s of video for most codecs) */
const DOWNLOAD_CHUNK = 15 * 1024 * 1024;

interface ThumbnailJob {
  cloudFrontPath: string;
  folder: string;
  videoUrl: string;
}

function firstVideoUrl(takes: Take[]): string | null {
  for (const take of takes) {
    if (take.videoUrl) return take.videoUrl;
    if (take.url && (take.url.endsWith('.mp4') || take.url.endsWith('.webm')))
      return take.url;
  }
  return null;
}

function getFfmpegCommand(): string {
  return process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
}

function isFfmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(getFfmpegCommand(), ['-version'], { stdio: 'pipe' });
    proc.on('error', () => resolve(false));
    proc.on('close', (code) => resolve(code === 0));
  });
}

/** Run FFmpeg on a local file path. */
function runFfmpegOnFile(inputPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const args = [
      '-ss', SEEK_TIME,
      '-i', inputPath,
      '-frames:v', '1',
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
      '-q:v', '2',
      '-y',
      outputPath,
    ];
    const proc = spawn(getFfmpegCommand(), args, { stdio: 'pipe' });
    const stderr: string[] = [];
    proc.stderr?.on('data', (d) => stderr.push(d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve(true);
      else {
        const msg = stderr.slice(-3).join('').trim();
        console.error('  FFmpeg error:', msg || code);
        resolve(false);
      }
    });
    proc.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        console.error('  FFmpeg not found. Install from https://ffmpeg.org (e.g. choco install ffmpeg) and ensure it is on PATH.');
      } else {
        console.error('  FFmpeg error:', err);
      }
      resolve(false);
    });
  });
}
/** Try FFmpeg with URL first; on failure, download chunk to temp file and try again. */
async function runFfmpeg(videoUrl: string, outputPath: string): Promise<boolean> {
  const direct = await runFfmpegOnFile(videoUrl, outputPath);
  if (direct) return true;

  const tempDir = path.join(process.cwd(), 'thumbnails-output', '.tmp');
  fs.mkdirSync(tempDir, { recursive: true });
  const ext = path.extname(new URL(videoUrl).pathname) || '.mp4';
  const tempPath = path.join(tempDir, `video-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);

  try {
    const res = await fetch(videoUrl, {
      headers: { Range: `bytes=0-${DOWNLOAD_CHUNK - 1}` },
    });
    if (!res.ok && res.status !== 206) {
      console.error('  Download failed:', res.status, res.statusText);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(tempPath, buf);
    const ok = await runFfmpegOnFile(tempPath, outputPath);
    return ok;
  } catch (e) {
    console.error('  Download error:', e);
    return false;
  } finally {
    try { fs.unlinkSync(tempPath); } catch { /* ignore */ }
  }
}

async function discoverJobs(): Promise<ThumbnailJob[]> {
  const jobs: ThumbnailJob[] = [];
  const projects = await loadAllProjects();

  for (const project of projects) {
    const cloudFrontPath = project.cloudFrontPath;
    if (!cloudFrontPath) continue;

    // Project folder is the last segment (e.g. VolumetricCaptureArchive/HolocaustSurvivors -> HolocaustSurvivors)
    const pathSegments = cloudFrontPath.split('/');
    const projectFolder = pathSegments[pathSegments.length - 1];
    const basePath = pathSegments.length > 1 ? pathSegments.slice(0, -1).join('/') : cloudFrontPath;

    const sessions = await loadProjectSessions(
      project.id,
      project.name,
      cloudFrontPath
    );

    let firstVideoInProject: string | null = null;

    for (const session of sessions) {
      const folder = session.folder ?? session.id;
      const takes = await loadSessionTakes(
        project.id,
        session.id,
        project.name,
        session.name,
        cloudFrontPath
      );
      const videoUrl = firstVideoUrl(takes);
      if (videoUrl) {
        jobs.push({ cloudFrontPath, folder, videoUrl });
        if (!firstVideoInProject) firstVideoInProject = videoUrl;
      } else {
        console.log(`⊘ No video for session: ${cloudFrontPath}/${folder}`);
      }
    }

    // One thumbnail per project (for project card) using first session's first video
    if (firstVideoInProject) {
      jobs.unshift({
        cloudFrontPath: basePath,
        folder: projectFolder,
        videoUrl: firstVideoInProject,
      });
    }
  }

  return jobs;
}

async function uploadToS3(
  localPath: string,
  s3Key: string,
  bucket: string
): Promise<boolean> {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const body = fs.readFileSync(localPath);
    const client = new S3Client({});
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: body,
        ContentType: 'image/jpeg',
        CacheControl: 'max-age=31536000',
      })
    );
    return true;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'ERR_MODULE_NOT_FOUND' || String(e).includes('@aws-sdk/client-s3')) {
      console.error('  Install @aws-sdk/client-s3 for S3 upload: npm install @aws-sdk/client-s3');
    } else {
      console.error('  S3 upload error:', e);
    }
    return false;
  }
}

async function main() {
  const upload = process.env.S3_BUCKET != null;

  const hasFfmpeg = await isFfmpegAvailable();
  if (!hasFfmpeg) {
    console.error('FFmpeg is required but not found on your PATH.');
    console.error('Install it, then run this script again:');
    console.error('  Windows: choco install ffmpeg  or  https://ffmpeg.org/download.html');
    console.error('  Mac: brew install ffmpeg');
    process.exit(1);
  }

  console.log('Thumbnails will be saved to your computer in:');
  console.log('  ' + OUT_DIR);
  console.log('');
  console.log('Discovering projects and sessions from content...');
  const jobs = await discoverJobs();
  console.log(`Found ${jobs.length} sessions with video to thumbnail.\n`);

  if (jobs.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < jobs.length; i++) {
    const { cloudFrontPath, folder, videoUrl } = jobs[i];
    const relDir = path.join(cloudFrontPath, folder);
    const outDir = path.join(OUT_DIR, relDir);
    const outPath = path.join(outDir, 'thumbnail.jpg');

    if (fs.existsSync(outPath)) {
      console.log(`[${i + 1}/${jobs.length}] ⊘ exists: ${relDir}/thumbnail.jpg`);
      ok++;
      if (upload) {
        const key = `${cloudFrontPath}/${folder}/thumbnail.jpg`;
        if (await uploadToS3(outPath, key, process.env.S3_BUCKET!)) {
          console.log(`  ✓ uploaded to s3://${process.env.S3_BUCKET}/${key}`);
        }
      }
      continue;
    }

    console.log(`[${i + 1}/${jobs.length}] ${relDir}`);
    fs.mkdirSync(outDir, { recursive: true });

    const success = await runFfmpeg(videoUrl, outPath);
    if (success) {
      console.log('  ✓ saved to computer');
      ok++;
      if (upload) {
        const key = `${cloudFrontPath}/${folder}/thumbnail.jpg`;
        if (await uploadToS3(outPath, key, process.env.S3_BUCKET!)) {
          console.log(`  ✓ uploaded to s3://${process.env.S3_BUCKET}/${key}`);
        }
      }
    } else {
      fail++;
    }
  }

  console.log('\nDone.');
  console.log(`Saved to your computer: ${ok} thumbnails. Failed: ${fail}`);
  console.log('Folder: ' + OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
