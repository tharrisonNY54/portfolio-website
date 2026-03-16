import Header from '@/components/Header'
import Gallery from '@/components/Gallery'
import { loadProjectSessions, getProject, loadSessionTakes } from '@/lib/content-loader';
import { redirect } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{ projectID: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectID } = await params;
  const decodedProjectID = decodeURIComponent(projectID);
  const project = await getProject(decodedProjectID);
  
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Project Not Found" showBackButton={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-12 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center opacity-50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)]">Project &quot;{decodedProjectID}&quot; not found</p>
          </div>
        </div>
      </div>
    );
  }
  
  const sessions = await loadProjectSessions(project.id, project.name, project.cloudFrontPath);

  // If no sessions found, check if this project has takes directly (no subfolder structure)
  // If so, redirect directly to the viewer (same experience as clicking a session)
  if (sessions.length === 0 && project.cloudFrontPath) {
    const takes = await loadSessionTakes(
      project.id,
      project.id, // Use project as session
      project.name,
      project.name,
      project.cloudFrontPath
    );
    
    // If we found takes, redirect to viewer immediately (like clicking a session)
    if (takes.length > 0) {
      redirect(`/projects/${encodeURIComponent(project.id)}/${encodeURIComponent(project.id)}`);
    }
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header 
        title={project.name} 
        subtitle={project.description || `${project.type === 'scannedreality' ? 'Hologram' : 'AR'} Recordings`}
        showBackButton={true}
      />
      
      {sessions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="glass rounded-2xl p-12 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center opacity-50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)]">No sessions or recordings found for this project</p>
          </div>
        </div>
      ) : (
        <Gallery projects={[]} projectID={project.id} sessions={sessions} />
      )}
    </div>
  );
}
