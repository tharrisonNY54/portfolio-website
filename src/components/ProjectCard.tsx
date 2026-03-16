'use client';

import Link from 'next/link';
import React, { useState } from 'react';

interface ProjectCardProps {
  id?: string;
  name: string;
  image: string;
  projectID?: string;
  isSession?: boolean;
  sessionType?: 'session' | 'project';
}

export default function ProjectCard({ id, name, image, projectID, isSession = false, sessionType = 'session'}: ProjectCardProps) {
  const [imgSrc, setImgSrc] = useState(image);
  const defaultImage = 'https://dpyy1piv6s0hg.cloudfront.net/VolumetricCaptureArchive/default_image.jpg';
  
  const handleImageError = () => {
    // If image fails to load and it's not already the default, use default
    if (imgSrc !== defaultImage) {
      setImgSrc(defaultImage);
    }
  };
  let href: string;
  if (isSession && projectID) {
    const sessionIdentifier = id || name;
    href = `/projects/${encodeURIComponent(projectID)}/${encodeURIComponent(sessionIdentifier)}`;
  } else if (projectID) {
    href = `/projects/${encodeURIComponent(projectID)}`;
  } else {
    href = `/projects/${encodeURIComponent(id || name)}`;
  }
  
  // Determine display text based on type
  const viewText = isSession ? (sessionType === 'project' ? 'sub-folders' : 'recordings') : 'sessions';

  return (
    <Link href={href}>
      <div className="group relative min-h-[320px] h-full rounded-2xl overflow-hidden glass-hover cursor-pointer">
        {/* Image container with overlay gradient */}
        <div className="absolute inset-0">
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            crossOrigin="anonymous"
            onError={handleImageError}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent opacity-90"></div>
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[var(--accent-cyan)]/20 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors duration-300">
              {name}
            </h2>
            
            {/* Decorative line */}
            <div className="w-0 group-hover:w-16 h-0.5 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] transition-all duration-500"></div>
            
            {/* View indicator - clear CTA */}
            <div className="flex items-center gap-2 text-base font-medium text-[var(--accent-cyan)] group-hover:underline underline-offset-2 transition-colors duration-300">
              <span>View {viewText}</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-[var(--accent-cyan)]/50 transition-colors duration-300 pointer-events-none"></div>
      </div>
    </Link>
  );
}
