import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  /** When set, back button goes here instead of "/". Use for session viewer (back to project or home). */
  backHref?: string;
}

export default function Header({ title, subtitle, showBackButton = false, backHref = '/' }: HeaderProps) {
  return (
    <header className="w-full glass border-b border-white/10 backdrop-blur-xl sticky top-0 z-50 relative overflow-hidden">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute top-4 left-4 w-12 h-px bg-[var(--accent-cyan)]"></div>
        <div className="absolute top-4 left-4 w-px h-12 bg-[var(--accent-cyan)]"></div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute top-4 right-4 w-12 h-px bg-[var(--accent-cyan)]"></div>
        <div className="absolute top-4 right-4 w-px h-12 bg-[var(--accent-cyan)]"></div>
      </div>
      
      <div className="relative py-4 px-4 md:py-6 md:px-6">
        {/* Mobile: title first, then back button below. Desktop: back absolute left, title centered. */}
        <div className="flex flex-col gap-2 md:block">
          <div className="text-center min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold gradient-text mb-1 tracking-wider uppercase" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', letterSpacing: '0.12em' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-[var(--text-secondary)] text-xs md:text-sm tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
          {showBackButton && (
            <Link 
              href={backHref}
              className="flex items-center gap-2 w-fit text-[var(--accent-cyan)] hover:text-[var(--accent-blue)] transition-colors md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 md:z-10"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Animated scan line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-24 h-px bg-[var(--accent-cyan)] opacity-60 animate-scan"></div>
    </header>
  );
}