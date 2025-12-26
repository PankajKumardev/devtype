'use client';

import { useTypingStore } from '@/store/typingStore';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useDataCache } from '@/store/dataCacheStore';

interface ResultsModalProps {
  onRestart: () => void;
  snippetsCompleted: number;
}

export default function ResultsModal({ onRestart, snippetsCompleted }: ResultsModalProps) {
  const { 
    isTestComplete, wpm, accuracy, language, duration, mode, keyErrors, 
    isNewPersonalBest, dailyStreak 
  } = useTypingStore();
  const { data: session } = useSession();
  const { invalidateDashboard, invalidateLeaderboard } = useDataCache();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveAttempted = useRef(false);
  const confettiTriggered = useRef(false);

  useEffect(() => {
    if (isTestComplete && isNewPersonalBest && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;
        
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        
        setTimeout(() => {
          confetti({ particleCount: 75, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 75, angle: 120, spread: 55, origin: { x: 1 } });
        }, 150);
      });
    }
    
    if (!isTestComplete) {
      confettiTriggered.current = false;
    }
  }, [isTestComplete, isNewPersonalBest]);

  useEffect(() => {
    // Auto-save score for timed tests
    if (isTestComplete && session && !autoSaveAttempted.current && mode === 'timed') {
      autoSaveAttempted.current = true;
      autoSaveScore();
    }
    
    if (!isTestComplete) {
      autoSaveAttempted.current = false;
      setSaveStatus('idle');
    }
  }, [isTestComplete, session, mode]);

  const autoSaveScore = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wpm, accuracy, language, duration }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        // Invalidate cache so dashboard and leaderboard refresh with new score
        invalidateDashboard();
        invalidateLeaderboard();
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving score:', error);
      setSaveStatus('error');
    }
  };

  useEffect(() => {
    if (!isTestComplete) return;
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        onRestart();
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isTestComplete, onRestart]);

  if (!isTestComplete) return null;

  const problemKeys = Object.entries(keyErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div 
      onClick={onRestart}
      className="fixed inset-0 bg-bg flex items-center justify-center z-50 cursor-pointer font-mono px-4 py-8 overflow-y-auto"
    >
      <div onClick={(e) => e.stopPropagation()} className="text-center w-full max-w-md sm:max-w-lg">
        {/* Personal Best Banner */}
        {isNewPersonalBest && (
          <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 border border-main rounded-lg inline-block" style={{ backgroundColor: 'rgba(226, 183, 20, 0.1)' }}>
            <span className="text-main text-xs sm:text-sm font-medium">new personal best!</span>
          </div>
        )}

        {/* Streak */}
        {dailyStreak > 0 && (
          <p className="text-sub text-xs sm:text-sm mb-3 sm:mb-4">{dailyStreak} day streak</p>
        )}

        {/* Main Stats */}
        <div className="flex justify-center gap-8 sm:gap-12 md:gap-16 mb-6 sm:mb-8">
          <div className="text-center">
            <p className="text-sub text-xs sm:text-sm mb-1 sm:mb-2">wpm</p>
            <p className="text-5xl sm:text-6xl md:text-7xl text-main font-normal">{wpm}</p>
          </div>
          <div className="text-center">
            <p className="text-sub text-xs sm:text-sm mb-1 sm:mb-2">accuracy</p>
            <p className="text-5xl sm:text-6xl md:text-7xl text-main font-normal">{accuracy}%</p>
          </div>
        </div>

        {/* Test Info */}
        <p className="text-sub text-xs sm:text-sm mb-6 sm:mb-8">
          {mode === 'practice' ? 'practice' : `${duration}s`} • {language}
          {snippetsCompleted > 0 && ` • ${snippetsCompleted + 1} snippets`}
        </p>

        {/* Problem Keys */}
        {problemKeys.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <p className="text-sub text-xs mb-2 sm:mb-3">missed keys</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {problemKeys.map(([key, count]) => (
                <div 
                  key={key}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-bg-sub border border-border text-center min-w-[36px] sm:min-w-[44px]"
                >
                  <span className="text-xs sm:text-sm text-text">
                    {key === ' ' ? 'spc' : key === '\n' ? 'ent' : key}
                  </span>
                  <p className="text-xs text-sub">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Status */}
        {session && mode === 'timed' && saveStatus !== 'idle' && (
          <p className={`text-xs mb-4 sm:mb-6 ${
            saveStatus === 'saved' ? 'text-main' : 
            saveStatus === 'error' ? 'text-error' : 
            'text-sub'
          }`}>
            {saveStatus === 'saving' && 'saving...'}
            {saveStatus === 'saved' && 'saved to leaderboard'}
            {saveStatus === 'error' && 'failed to save'}
          </p>
        )}

        {/* Next Test Button */}
        <button
          onClick={onRestart}
          className="px-6 sm:px-8 py-2.5 sm:py-3 bg-main hover:opacity-80 border-none rounded-lg text-xs sm:text-sm font-medium cursor-pointer font-mono transition-opacity"
          style={{ color: '#1a1a1a' }}
        >
          {mode === 'practice' ? 'continue' : 'next test'}
        </button>

        {!session && mode === 'timed' && (
          <p className="text-sub text-xs mt-4 sm:mt-6">login to save scores</p>
        )}

        <p className="text-sub/40 text-xs mt-6 sm:mt-8 hidden sm:block">
          press enter to continue
        </p>
        <p className="text-sub/40 text-xs mt-6 sm:hidden">
          tap to continue
        </p>
      </div>
    </div>
  );
}
