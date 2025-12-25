'use client';

import { useTypingStore } from '@/store/typingStore';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

interface ResultsModalProps {
  onRestart: () => void;
  snippetsCompleted: number;
}

export default function ResultsModal({ onRestart, snippetsCompleted }: ResultsModalProps) {
  const { isTestComplete, wpm, accuracy, language, duration, mode, keyErrors } = useTypingStore();
  const { data: session } = useSession();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveAttempted = useRef(false);

  useEffect(() => {
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
      className="fixed inset-0 bg-bg flex items-center justify-center z-50 cursor-pointer font-mono px-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="text-center max-w-2xl w-full">
        {/* Main Stats */}
        <div className="flex gap-8 md:gap-24 justify-center mb-6 md:mb-8">
          <div className="text-left">
            <p className="text-sm md:text-base text-sub mb-1 md:mb-2">wpm</p>
            <p className="text-5xl md:text-8xl text-main font-normal leading-none">{wpm}</p>
          </div>
          <div className="text-left">
            <p className="text-sm md:text-base text-sub mb-1 md:mb-2">accuracy</p>
            <p className="text-5xl md:text-8xl text-main font-normal leading-none">{accuracy}%</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex gap-3 md:gap-5 justify-center mb-6 md:mb-8 text-xs md:text-sm text-sub flex-wrap">
          <span>{mode === 'practice' ? 'practice' : `${duration}s`}</span>
          <span>•</span>
          <span>{language === 'all' ? 'mixed' : language}</span>
          {snippetsCompleted > 0 && (
            <>
              <span>•</span>
              <span>{snippetsCompleted + 1} snippets</span>
            </>
          )}
        </div>

        {/* Problem Keys */}
        {problemKeys.length > 0 && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 bg-bg-sub rounded-xl border border-border">
            <p className="text-xs md:text-sm text-sub mb-2 md:mb-3">most missed keys</p>
            <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
              {problemKeys.map(([key, count]) => (
                <div 
                  key={key}
                  className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-center min-w-[40px] md:min-w-[50px]"
                  style={{
                    backgroundColor: `rgba(202, 71, 84, ${Math.min(count * 0.15, 0.8)})`,
                    border: '1px solid rgba(202, 71, 84, 0.5)',
                  }}
                >
                  <span className="text-base md:text-lg font-medium text-text">
                    {key === ' ' ? '␣' : key === '\n' ? '↵' : key}
                  </span>
                  <p className="text-xs text-sub mt-0.5 md:mt-1">{count}x</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Status */}
        <div className="flex gap-5 justify-center mb-3 md:mb-4">
          {session && mode === 'timed' && (
            <span className={`text-xs md:text-sm ${saveStatus === 'saved' ? 'text-main' : saveStatus === 'error' ? 'text-error' : 'text-sub'}`}>
              {saveStatus === 'saving' && 'auto-saving...'}
              {saveStatus === 'saved' && 'saved to leaderboard'}
              {saveStatus === 'error' && 'failed to save'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-5 justify-center">
          <button
            onClick={onRestart}
            className="px-6 md:px-8 py-3 md:py-4 bg-main hover:bg-yellow-600 border-none rounded-lg text-sm md:text-base font-medium text-bg cursor-pointer font-mono transition-colors"
          >
            {mode === 'practice' ? 'continue practice' : 'next test'}
          </button>
        </div>

        {!session && mode === 'timed' && (
          <p className="text-sub text-xs md:text-sm mt-4 md:mt-6">
            login to auto-save your scores
          </p>
        )}

        <p className="text-sub/50 text-xs mt-6 md:mt-8 hidden md:block">
          press enter or click anywhere to continue
        </p>
        <p className="text-sub/50 text-xs mt-6 md:hidden">
          tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
