/**
 * Unified Content Loader
 * Loads content from both:
 * 1. CloudFront index.txt files (Scanned Reality)
 * 2. Local content-index.json (8th Wall and hybrid)
 */

import fs from 'fs';
import path from 'path';

const CLOUDFRONT_BASE =
  process.env.NEXT_PUBLIC_CLOUDFRONT_URL || 'https://dpyy1piv6s0hg.cloudfront.net';

export interface Take {
  name: string;
  url?: string;           // For .xrv files (ScannedReality)
  fallbackVideoUrl?: string; // Optional 2D fallback video URL
  videoUrl?: string;      // For 8th Wall .mp4
  bytesUrl?: string;      // For 8th Wall .bytes
  type: 'scannedreality' | '8thwall';
  
  // 8th Wall optional properties
  slidesUrl?: string;           // URL to .glb slideshow file
  cropSeconds?: number;         // Seconds to crop from end of video
  image?: string;               // Background image URL
  imageOrientation?: 'vertical' | 'horizontal';  // Image orientation
  regularImages?: string[];     // Array of regular image URLs
  images360?: string[];         // Array of 360° image URLs
}

export interface Session {
  id: string;
  name: string;
  thumbnail?: string;
  takes?: Take[];
  type?: 'session' | 'project';  // For nested project structures
  cloudFrontPath?: string;        // For loading nested content
  folder?: string;                // Original folder name (for CloudFront paths)
}

export interface Project {
  id: string;
  name: string;
  type: 'scannedreality' | '8thwall' | 'mixed';
  description?: string;
  thumbnail?: string;
  sessions?: Session[];
  cloudFrontPath?: string; // Base path for loading sessions (e.g., "HolocaustSurvivors")
}

interface ContentIndex {
  projects: Array<{
    id: string;
    name: string;
    type: 'scannedreality' | '8thwall' | 'mixed';
    description?: string;
    useCloudFrontIndex?: boolean;
    indexUrl?: string;
    cloudFrontPath?: string;
    sessions?: Session[];
  }>;
}

/**
 * Load content index from local filesystem
 */
function loadContentIndex(): ContentIndex {
  try {
    const indexPath = path.join(process.cwd(), 'public', 'content-index.json');
    const fileContent = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading content-index.json:', error);
    return { projects: [] };
  }
}

/**
 * Fetch and parse CloudFront index.txt file
 */
async function fetchCloudFrontIndex(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `[content-loader] Failed to fetch index: ${response.status} ${response.statusText}`,
        url
      );
      return null;
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('[content-loader] Invalid JSON in index:', url, parseError);
      return null;
    }
  } catch (error) {
    console.error('[content-loader] Network error fetching index:', url, error);
    return null;
  }
}

/**
 * Generate thumbnail URL from folder path
 * Returns expected thumbnail location without checking if it exists
 * (Let the browser handle the 404 and fall back to default)
 */
function getAutoThumbnailUrl(cloudFrontPath: string, folder: string): string {
  return `${CLOUDFRONT_BASE}/${cloudFrontPath}/${folder}/thumbnail.jpg`;
}

/**
 * Load projects from CloudFront index
 */
async function loadProjectsFromCloudFront(
  indexUrl: string,
  projectType: 'scannedreality' | '8thwall' | 'mixed',
  cloudFrontPath?: string
): Promise<Project[]> {
  const projectsData = await fetchCloudFrontIndex(indexUrl);
  if (!projectsData || !Array.isArray(projectsData)) {
    return [];
  }

  // projectsData format: [{ name, folder, thumbnail }, ...]
  const projects: Project[] = projectsData.map((item) => {
    const name = item.name || item.folder || '';
    const folder = item.folder || name.toLowerCase().replace(/\s+/g, '-');
    const projectCloudFrontPath = `${cloudFrontPath || 'VolumetricCaptureArchive'}/${folder}`;
    // Use provided thumbnail, or construct expected auto-thumbnail URL
    const thumbnail = item.thumbnail || getAutoThumbnailUrl(cloudFrontPath || 'VolumetricCaptureArchive', folder);

    return {
      id: folder.toLowerCase().replace(/\s+/g, '-'),
      name,
      type: projectType,
      thumbnail,
      cloudFrontPath: projectCloudFrontPath, // Store base path for loading sessions
    };
  });

  return projects;
}

/**
 * Load sessions for any project from CloudFront
 * 
 * IMPORTANT: This function filters out takes and only returns sessions
 * - If item has type: "session" or "project" → it's a session
 * - If item has type: "8thwall" or "scannedreality" → it's a take, skip it
 * - If no type field → assume it's a session (backwards compatibility)
 */
async function loadSessionsFromCloudFront(
  cloudFrontPath: string
): Promise<Session[]> {
  const indexUrl = `${CLOUDFRONT_BASE}/${cloudFrontPath}/index.txt`;
  console.log('[loadSessionsFromCloudFront] Fetching sessions from:', indexUrl);
  console.log('[loadSessionsFromCloudFront] cloudFrontPath:', cloudFrontPath);
  const sessionsData = await fetchCloudFrontIndex(indexUrl);
  
  if (!sessionsData || !Array.isArray(sessionsData)) {
    return [];
  }

  // Filter out takes - only process sessions
  const sessions: Session[] = sessionsData
    .filter((item) => {
      // If item has a type field, check if it's a session/project
      if (item.type) {
        // Only include sessions and sub-projects, skip takes
        return item.type === 'session' || item.type === 'project';
      }
      // No type field = assume it's a session (backwards compatibility)
      return true;
    })
    .map((item) => {
      const name = item.name || item.folder || '';
      const folder = item.folder || name.replace(/\s+/g, '-');
      // Use provided thumbnail, or construct expected auto-thumbnail URL
      const thumbnail = item.thumbnail || getAutoThumbnailUrl(cloudFrontPath, folder);

      return {
        id: folder.toLowerCase().replace(/\s+/g, '-'),
        name,
        thumbnail,
        folder, // Store original folder name for CloudFront paths
        type: item.type, // Preserve type for sub-projects
        cloudFrontPath: item.type === 'project' ? `${cloudFrontPath}/${folder}` : undefined,
      };
    });

  return sessions;
}

/**
 * Load takes/recordings for any session (auto-detects type)
 */
async function loadSessionTakesFromCloudFront(
  cloudFrontPath: string
): Promise<Take[]> {
  const indexUrl = `${CLOUDFRONT_BASE}/${cloudFrontPath}/index.txt`;
  const takesData = await fetchCloudFrontIndex(indexUrl);
  
  if (!takesData || !Array.isArray(takesData)) {
    return [];
  }

  const takes: Take[] = [];

  for (let i = 0; i < takesData.length; i++) {
    const item = takesData[i];

    // Format 1: Object with type specified
    if (typeof item === 'object' && item !== null && 'type' in item) {
      takes.push({
        name: item.name || `Recording ${i + 1}`,
        type: item.type,
        url: item.url,
        videoUrl: item.videoUrl,
        bytesUrl: item.bytesUrl,
        // 8th Wall optional properties
        slidesUrl: item.slidesUrl,
        cropSeconds: item.cropSeconds,
        image: item.image,
        imageOrientation: item.imageOrientation,
        regularImages: item.regularImages,
        images360: item.images360,
      });
    }
    // Format 2: Simple string (URL) - auto-detect type
    else if (typeof item === 'string') {
      const url = item;
      const filename = url.split('/').pop() || '';
      const nameMatch = filename.match(/Take(\d+)/i);
      const takeName = nameMatch ? `Take ${nameMatch[1]}` : `Recording ${i + 1}`;

      // Auto-detect type from file extension
      if (url.endsWith('.xrv')) {
        takes.push({
          name: takeName,
          url,
          type: 'scannedreality' as const,
        });
      } else if (url.endsWith('.mp4')) {
        // Look for corresponding .bytes file
        const bytesUrl = url.replace('.mp4', '.bytes');
        takes.push({
          name: takeName,
          videoUrl: url,
          bytesUrl: bytesUrl,
          type: '8thwall' as const,
        });
      }
    }
  }

  return takes;
}

/**
 * Load all projects (both Scanned Reality and 8th Wall)
 */
export async function loadAllProjects(): Promise<Project[]> {
  try {
    // Load the content index from filesystem
    const contentIndex = loadContentIndex();

    const allProjects: Project[] = [];

    // Process each project in the index
    for (const projectConfig of contentIndex.projects) {
      if (projectConfig.useCloudFrontIndex && projectConfig.indexUrl) {
        // This project uses CloudFront index.txt files
        const cfProjects = await loadProjectsFromCloudFront(
          projectConfig.indexUrl,
          projectConfig.type,
          projectConfig.cloudFrontPath
        );
        allProjects.push(...cfProjects);
      } else {
        // This project is manually defined
        allProjects.push({
          id: projectConfig.id,
          name: projectConfig.name,
          type: projectConfig.type,
          description: projectConfig.description,
          sessions: projectConfig.sessions,
          cloudFrontPath: projectConfig.cloudFrontPath,
        });
      }
    }

    return allProjects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Load sessions for a specific project
 */
export async function loadProjectSessions(
  projectId: string,
  projectName?: string,
  cloudFrontPath?: string
): Promise<Session[]> {
  try {
    console.log('[loadProjectSessions] Called with:', { projectId, projectName, cloudFrontPath });
    const contentIndex = loadContentIndex();
    
    const project = contentIndex.projects.find(p => p.id === projectId);
    console.log('[loadProjectSessions] Found project in index:', project);
    
    if (project && project.sessions) {
      // Manually defined sessions
      console.log('[loadProjectSessions] Using manually defined sessions');
      return project.sessions;
    }
    
    // If project uses CloudFront index OR if we have cloudFrontPath (dynamically loaded project)
    const basePath = cloudFrontPath || project?.cloudFrontPath;
    if (basePath) {
      // Load from CloudFront using the cloudFrontPath
      console.log('[loadProjectSessions] Loading from CloudFront, basePath:', basePath);
      return await loadSessionsFromCloudFront(basePath);
    }
    
    console.log('[loadProjectSessions] No matching condition, returning empty array');
  } catch (error) {
    console.error('Error loading sessions:', error);
  }

  return [];
}

/**
 * Load takes for a specific session
 * 
 * Special case: If projectId === sessionId, this means the project has clips directly
 * (no subfolder structure), so we load from the project's own index.txt
 */
export async function loadSessionTakes(
  projectId: string,
  sessionId: string,
  projectName?: string,
  sessionName?: string,
  cloudFrontPath?: string
): Promise<Take[]> {
  // First, check if it's in the manual content index
  try {
    const contentIndex = loadContentIndex();
    
    const project = contentIndex.projects.find(p => p.id === projectId);
    if (project && project.sessions) {
      const session = project.sessions.find(s => s.id === sessionId);
      if (session?.takes) {
        return session.takes;
      }
    }
    
    // If not found manually, try CloudFront
    if (cloudFrontPath) {
      // Special case: If projectId === sessionId, load from project's own index.txt
      // This means the project has clips directly (e.g., Feng-Feng, CDH, VetMed)
      if (projectId === sessionId) {
        console.log('[loadSessionTakes] Loading takes directly from project (no subfolder):', cloudFrontPath);
        return await loadSessionTakesFromCloudFront(cloudFrontPath);
      }
      
      // Normal case: Project has sessions/subfolders
      // Need to append the session folder to the project path
      const sessions = await loadProjectSessions(projectId, projectName, cloudFrontPath);
      const session = sessions.find(s => s.id === sessionId);
      const sessionFolder = session?.folder || sessionId;
      const fullPath = `${cloudFrontPath}/${sessionFolder}`;
      console.log('[loadSessionTakes] Loading takes from session subfolder:', fullPath);
      return await loadSessionTakesFromCloudFront(fullPath);
    }
  } catch (error) {
    console.error('Error loading takes:', error);
  }

  return [];
}

/**
 * Get project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const projects = await loadAllProjects();
  return projects.find(p => p.id === projectId) || null;
}