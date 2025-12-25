'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import ThemeSelector from './ThemeSelector';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full py-4 md:py-6 px-4 md:px-10 font-mono">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-medium text-main no-underline hover:opacity-80 transition-opacity">
          devtype
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <ThemeSelector />
          <div className="w-px h-5 bg-border" />
          <Link href="/leaderboard" className="text-sm text-sub no-underline hover:text-text transition-colors">
            leaderboard
          </Link>
          
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-sub no-underline hover:text-text transition-colors">
                {session.user?.name || 'profile'}
              </Link>
              <button 
                onClick={() => signOut()}
                className="text-sm text-sub bg-transparent border-none cursor-pointer font-mono hover:text-text transition-colors"
              >
                logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="px-5 py-2.5 text-sm font-medium text-bg bg-main hover:bg-yellow-600 rounded-lg cursor-pointer font-mono border-none transition-colors"
            >
              login
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-sub bg-transparent border-none cursor-pointer p-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-bg-sub rounded-lg p-4 flex flex-col gap-4">
          <ThemeSelector />
          <Link 
            href="/leaderboard" 
            className="text-sm text-sub no-underline hover:text-text transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            leaderboard
          </Link>
          
          {session ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm text-sub no-underline hover:text-text transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {session.user?.name || 'profile'}
              </Link>
              <button 
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="text-sm text-sub bg-transparent border-none cursor-pointer font-mono hover:text-text transition-colors text-left"
              >
                logout
              </button>
            </>
          ) : (
            <button
              onClick={() => { signIn('google'); setMenuOpen(false); }}
              className="px-5 py-2.5 text-sm font-medium text-bg bg-main hover:bg-yellow-600 rounded-lg cursor-pointer font-mono border-none transition-colors w-full"
            >
              login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
