'use client';

import { Take } from '@/lib/content-loader';
import { useRouter } from 'next/navigation';

interface TakeSelectorProps {
  takes: Take[];
  currentIndex: number;
  projectID: string;
  sessionID: string;
}

export default function TakeSelector({ takes, currentIndex, projectID, sessionID }: TakeSelectorProps) {
  const router = useRouter();

  const handleTakeChange = (index: number) => {
    const basePath = `/projects/${encodeURIComponent(projectID)}/${encodeURIComponent(sessionID)}`;
    router.push(`${basePath}?take=${index}`);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleTakeChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < takes.length - 1) {
      handleTakeChange(currentIndex + 1);
    }
  };

  return (
    <div className="glass border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col gap-4">
          {/* Header with navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[var(--text-secondary)] text-sm font-medium">
                Select Recording:
              </span>
              <span className="text-[var(--accent-cyan)] text-sm font-semibold">
                {currentIndex + 1} / {takes.length}
              </span>
            </div>
            
            {/* Navigation arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`
                  p-3 rounded-xl transition-all duration-300
                  ${currentIndex === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : 'glass-hover hover:text-[var(--accent-cyan)] hover:scale-110 active:scale-95'
                  }
                `}
                aria-label="Previous recording"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentIndex === takes.length - 1}
                className={`
                  p-3 rounded-xl transition-all duration-300
                  ${currentIndex === takes.length - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'glass-hover hover:text-[var(--accent-cyan)] hover:scale-110 active:scale-95'
                  }
                `}
                aria-label="Next recording"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            {takes.map((take, index) => (
              <button
                key={index}
                onClick={() => handleTakeChange(index)}
                className={`
                  relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  ${index === currentIndex
                    ? 'text-[var(--text-primary)] shadow-md shadow-[var(--accent-cyan)]/15'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {/* Active state background */}
                {index === currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] opacity-20"></div>
                )}
                
                {/* Pill background */}
                <div className={`
                  absolute inset-0 rounded-full transition-all duration-300
                  ${index === currentIndex
                    ? 'glass border border-[var(--accent-cyan)]/35'
                    : 'glass border border-white/10 hover:border-[var(--accent-cyan)]/25'
                  }
                `}></div>
                
                {/* Text */}
                <span className="relative z-10">{take.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)]/30 to-transparent"></div>
    </div>
  );
}
