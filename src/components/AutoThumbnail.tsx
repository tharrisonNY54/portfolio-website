'use client';

import { useEffect, useState } from 'react';
import { generateVideoThumbnail } from '@/lib/video-thumbnail';

interface AutoThumbnailProps {
  videoUrl?: string;
  fallbackImage: string;
  alt: string;
  className?: string;
}

/**
 * Component that automatically generates a thumbnail from a video if no thumbnail exists
 */
export default function AutoThumbnail({ 
  videoUrl, 
  fallbackImage, 
  alt, 
  className 
}: AutoThumbnailProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState(fallbackImage);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // If fallback is the default image and we have a video URL, generate thumbnail
    const isDefaultImage = fallbackImage.includes('default_image.jpg');
    
    if (isDefaultImage && videoUrl) {
      setIsGenerating(true);
      generateVideoThumbnail(videoUrl, 2.0)
        .then(thumbnail => {
          setThumbnailSrc(thumbnail);
        })
        .catch(error => {
          console.error('Failed to generate thumbnail:', error);
          // Keep using fallback
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [videoUrl, fallbackImage]);

  return (
    <>
      <img
        src={thumbnailSrc}
        alt={alt}
        className={className}
        crossOrigin="anonymous"
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
}
