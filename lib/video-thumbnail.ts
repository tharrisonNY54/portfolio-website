/**
 * Generate thumbnail from video URL
 * This creates a thumbnail by loading the video and extracting a frame
 */

export async function generateVideoThumbnail(
  videoUrl: string,
  seekTime: number = 2.0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    video.addEventListener('loadedmetadata', () => {
      // Seek to specified time (or middle of video if seekTime > duration)
      video.currentTime = Math.min(seekTime, video.duration / 2);
    });
    
    video.addEventListener('seeked', () => {
      try {
        // Create canvas and draw video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailUrl);
      } catch (error) {
        reject(error);
      }
    });
    
    video.addEventListener('error', () => {
      reject(new Error('Error loading video'));
    });
    
    video.src = videoUrl;
  });
}

/**
 * Cache for generated thumbnails to avoid regenerating
 */
const thumbnailCache = new Map<string, string>();

export async function getCachedVideoThumbnail(videoUrl: string): Promise<string> {
  if (thumbnailCache.has(videoUrl)) {
    return thumbnailCache.get(videoUrl)!;
  }
  
  const thumbnail = await generateVideoThumbnail(videoUrl);
  thumbnailCache.set(videoUrl, thumbnail);
  return thumbnail;
}
