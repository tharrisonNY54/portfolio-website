'use client';

import React from 'react';
import ProjectCard from './ProjectCard';

interface ScrollGalleryProps {
  projects: [string, string][];
  projectID?: string;
  sessions?: Array<{ 
    id: string; 
    name: string; 
    thumbnail?: string;
    type?: 'session' | 'project';
  }>;
}

export default function ScrollGallery({ projects, projectID, sessions }: ScrollGalleryProps) {
  if (sessions) {
    return (
      <div className="w-full h-full overflow-y-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Available Sessions
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sessions.map((session) => (
              <ProjectCard
                key={session.id}
                id={session.id}
                name={session.name}
                image={session.thumbnail || 'https://dpyy1piv6s0hg.cloudfront.net/VolumetricCaptureArchive/default_image.jpg'}
                projectID={projectID}
                isSession={true}
                sessionType={session.type}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full overflow-y-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {projects.map(([title, image]) => (
            <ProjectCard
              key={title}
              name={title}
              image={image}
              projectID={projectID}
              isSession={!!projectID}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
