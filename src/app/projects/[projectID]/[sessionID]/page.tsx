import HologramPlayerWrapper from "./HologramPlayerWrapper";
import { loadSessionTakes, getProject, loadProjectSessions, type Session } from "@/lib/content-loader";
import TakeSelector from "./TakeSelector";
import Header from "@/components/Header";
import Link from "next/link";

interface SessionPageProps {
  params: Promise<{ projectID: string; sessionID: string }>;
  searchParams: Promise<{ take?: string }>;
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const { projectID, sessionID } = await params;
  const decodedProjectID = decodeURIComponent(projectID);
  const decodedSessionID = decodeURIComponent(sessionID);

  const project = await getProject(decodedProjectID);
  
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="glass border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href="/" className="flex items-center gap-2 text-[var(--accent-cyan)] hover:text-[var(--accent-blue)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-12 text-center max-w-md">
            <p className="text-[var(--text-secondary)]">Project not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Special case: If projectID === sessionID, this is a project with direct clips (no sessions)
  // Skip session lookup and go straight to loading takes
  let session = null;
  let sessions: Session[] = [];
  
  if (decodedProjectID !== decodedSessionID) {
    // Normal case: Load sessions and find the matching one
    sessions = await loadProjectSessions(project.id, project.name, project.cloudFrontPath);
    session = sessions.find(s => s.id === decodedSessionID);
  } else {
    // Direct clips case: Treat project as its own "session"
    session = {
      id: project.id,
      name: project.name,
      thumbnail: project.thumbnail,
    };
  }
  
  // Check if this "session" is actually a sub-project
  if (session && session.type === 'project' && session.cloudFrontPath) {
    // This is a sub-project, load its sessions and display them
    const subSessions = await loadProjectSessions(session.id, session.name, session.cloudFrontPath);
    
    return (
      <div className='min-h-screen flex flex-col'>
        <header className="glass border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href={decodedProjectID === decodedSessionID ? "/" : `/projects/${projectID}`} className="flex items-center gap-2 text-[var(--accent-cyan)] hover:text-[var(--accent-blue)] transition-colors mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back{decodedProjectID === decodedSessionID ? "" : ` to ${project.name}`}</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold gradient-text tracking-wider uppercase" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', letterSpacing: '0.12em' }}>
              {session.name}
            </h1>
          </div>
        </header>
        
        {subSessions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="glass rounded-2xl p-12 text-center max-w-md">
              <p className="text-[var(--text-secondary)]">No sessions found</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full overflow-y-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
            <div className="max-w-[1800px] mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Available Sessions
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subSessions.map((subSession) => (
                  <Link 
                    key={subSession.id}
                    href={`/projects/${projectID}/${sessionID}/${subSession.id}`}
                    className="group relative min-h-[320px] h-full rounded-2xl overflow-hidden glass-hover cursor-pointer"
                  >
                    <div className="absolute inset-0">
                      <img
                        src={subSession.thumbnail || 'https://dpyy1piv6s0hg.cloudfront.net/VolumetricCaptureArchive/default_image.jpg'}
                        alt={subSession.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent opacity-90"></div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[var(--accent-cyan)]/20 to-transparent"></div>
                    </div>
                    
                    <div className="relative h-full flex flex-col justify-end p-6">
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors duration-300">
                          {subSession.name}
                        </h2>
                        <div className="w-0 group-hover:w-16 h-0.5 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] transition-all duration-500"></div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] group-hover:text-[var(--accent-cyan)] transition-colors duration-300">
                          <span>View recordings</span>
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-[var(--accent-cyan)]/50 transition-colors duration-300 pointer-events-none"></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="glass border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href={decodedProjectID === decodedSessionID ? "/" : `/projects/${projectID}`} className="flex items-center gap-2 text-[var(--accent-cyan)] hover:text-[var(--accent-blue)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back{decodedProjectID === decodedSessionID ? "" : " to Project"}</span>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-12 text-center max-w-md">
            <p className="text-[var(--text-secondary)]">Session not found</p>
          </div>
        </div>
      </div>
    );
  }

  const takes = await loadSessionTakes(
    project.id,
    session.id,
    project.name,
    session.name,
    project.cloudFrontPath
  );

  if (takes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="glass border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="text-center">
              <h1 className="text-xl font-semibold gradient-text mb-1 tracking-wider uppercase" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', letterSpacing: '0.12em' }}>
                {project.name} — {session.name}
              </h1>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-12 text-center max-w-md">
            <p className="text-[var(--text-secondary)]">No recordings found for this session</p>
          </div>
        </div>
      </div>
    );
  }

  const searchParamsResolved = await searchParams;
  const currentTakeIndex = searchParamsResolved.take 
    ? parseInt(searchParamsResolved.take) 
    : 0;
  const currentTake = takes[currentTakeIndex] || takes[0];

  return (
    <div className="h-screen flex flex-col">
      <Header
        title={`${project.name} — ${session.name}`}
        showBackButton
        backHref={decodedProjectID === decodedSessionID ? '/' : `/projects/${projectID}`}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Take Selector */}
        {takes.length > 1 && (
          <TakeSelector 
            takes={takes}
            currentIndex={currentTakeIndex}
            projectID={project.id}
            sessionID={session.id}
          />
        )}

        {/* Viewer */}
        <div className="flex-1 relative">
          {currentTake.type === 'scannedreality' && currentTake.url && (
            <HologramPlayerWrapper
              videoUrl={currentTake.url}
              fallbackVideoUrl={currentTake.fallbackVideoUrl}
            />
          )}

          {currentTake.type === '8thwall' && (!currentTake.videoUrl || !currentTake.bytesUrl) && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]">
              <div className="glass rounded-2xl p-8 max-w-md text-center">
                <p className="text-[var(--text-secondary)]">
                  This recording is missing video or mesh data. Check the index file for valid videoUrl and bytesUrl.
                </p>
              </div>
            </div>
          )}
          
          {currentTake.type === '8thwall' && currentTake.videoUrl && currentTake.bytesUrl && (() => {
            const params = new URLSearchParams({
              videoUrl: currentTake.videoUrl,
              bytesUrl: currentTake.bytesUrl,
            });
            
            if (currentTake.slidesUrl) params.append('slidesUrl', currentTake.slidesUrl);
            if (currentTake.cropSeconds !== undefined) params.append('cropSeconds', currentTake.cropSeconds.toString());
            if (currentTake.image) params.append('image', currentTake.image);
            if (currentTake.imageOrientation) params.append('imageOrientation', currentTake.imageOrientation);
            if (currentTake.regularImages && currentTake.regularImages.length > 0) {
              params.append('regularImages', JSON.stringify(currentTake.regularImages));
            }
            if (currentTake.images360 && currentTake.images360.length > 0) {
              params.append('images360', JSON.stringify(currentTake.images360));
            }
            
            return (
              <iframe
                src={`/8thwall/index.html?${params.toString()}`}
                className="w-full h-full border-0"
                allow="camera; microphone; gyroscope; accelerometer; xr-spatial-tracking"
                title="8th Wall AR Viewer"
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
