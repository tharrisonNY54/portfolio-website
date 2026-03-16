import Header from '@/components/Header'
import ProjectCard from '@/components/ProjectCard'

import { loadAllProjects } from '@/lib/content-loader';

export default async function Home() {
  const projects = await loadAllProjects();

  return (
    <div className='min-h-screen flex flex-col'>
      <Header 
        title="Volumetric Capture Archive" 
        subtitle="Center for Digital Humanities - University of Arizona"
      />
      
      <main className="flex-1 px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
        <div className="max-w-[1800px] mx-auto">
          {/* Projects section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Projects
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-full"></div>
          </div>
          
          {projects.length === 0 ? (
            <div className="flex justify-center">
              <div className="glass rounded-2xl p-12 text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center opacity-50">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-[var(--text-secondary)]">No projects available yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  image={project.thumbnail || 'https://dpyy1piv6s0hg.cloudfront.net/VolumetricCaptureArchive/default_image.jpg'}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="glass border-t border-white/10 mt-auto">
        <div className="px-6 py-6 text-center text-[var(--text-muted)] text-sm">
          <p>© 2026 Center for Digital Humanities - University of Arizona</p>
        </div>
      </footer>
    </div>
  );
}
