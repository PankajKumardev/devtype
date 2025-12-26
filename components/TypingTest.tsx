'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTypingStore } from '@/store/typingStore';

interface TypingTestProps {
  onSnippetComplete: () => void;
  onExit: () => void;
}

export default function TypingTest({ onSnippetComplete, onExit }: TypingTestProps) {
  const {
    currentSnippet,
    userInput,
    isTestActive,
    isTestComplete,
    isPaused,
    timeRemaining,
    mode,
    liveWpm,
    updateInput,
    tick,
    startTest,
    pauseTest,
    resumeTest,
    resetTest,
    calculateResults,
    loadStreak,
    loadPersonalBest,
  } = useTypingStore();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [practiceTime, setPracticeTime] = useState(0);
  const [showHints, setShowHints] = useState(true);

  useEffect(() => {
    loadStreak();
    loadPersonalBest();
  }, [loadStreak, loadPersonalBest]);

  useEffect(() => {
    if (isTestActive && !isPaused && timeRemaining > 0 && mode === 'timed') {
      const timer = setInterval(tick, 1000);
      return () => clearInterval(timer);
    }
  }, [isTestActive, isPaused, timeRemaining, tick, mode]);

  useEffect(() => {
    if (isTestActive && !isPaused && mode === 'practice') {
      const timer = setInterval(() => setPracticeTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isTestActive, isPaused, mode]);

  useEffect(() => {
    if (isTestActive && !isPaused && userInput.length === currentSnippet.length && currentSnippet.length > 0) {
      onSnippetComplete();
    }
  }, [userInput, currentSnippet, isTestActive, isPaused, onSnippetComplete]);

  const focusInput = useCallback(() => {
    if (!isPaused) inputRef.current?.focus();
  }, [isPaused]);

  useEffect(() => {
    focusInput();
  }, [focusInput, currentSnippet, isPaused]);

  useEffect(() => {
    let tabPressed = false;
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Track Tab key
      if (e.key === 'Tab') {
        tabPressed = true;
        // Don't prevent default here - let Tab work normally for typing
      }
      
      // Tab + Enter to restart (like MonkeyType)
      if (e.key === 'Enter' && tabPressed && isTestActive) {
        e.preventDefault();
        resetTest();
        onExit();
        tabPressed = false;
        return;
      }
      
      if (e.key === 'Escape' && isTestActive) {
        if (mode === 'practice') {
          calculateResults();
        }
        resetTest();
        onExit();
      }
      if (e.key === ' ' && isPaused) {
        e.preventDefault();
        resumeTest();
        focusInput();
      }
    };
    
    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = false;
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [isTestActive, isPaused, resetTest, resumeTest, onExit, focusInput, mode, calculateResults]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isTestComplete || isPaused) return;
    if (!isTestActive) {
      startTest();
      setPracticeTime(0);
      setShowHints(false);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const newValue = userInput + '\n';
      if (newValue.length <= currentSnippet.length) updateInput(newValue);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const newValue = userInput + '    ';
      if (newValue.length <= currentSnippet.length) updateInput(newValue);
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (userInput.length > 0) updateInput(userInput.slice(0, -1));
      return;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isTestComplete || isPaused) return;
    if (!isTestActive) {
      startTest();
      setPracticeTime(0);
      setShowHints(false);
    }
    const newValue = e.target.value;
    if (newValue.length <= currentSnippet.length) updateInput(newValue);
  };

  const handleFinishPractice = () => {
    calculateResults();
    resetTest();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`;
  };

  const progress = currentSnippet.length > 0 
    ? Math.round((userInput.length / currentSnippet.length) * 100) 
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-10 font-mono">
      {/* Timer, Live WPM and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-8">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Timer */}
          <div 
            className="text-3xl sm:text-4xl md:text-6xl"
            style={{ color: isPaused ? 'var(--color-sub)' : 'var(--color-main)' }}
          >
            {mode === 'practice' ? formatTime(practiceTime) : timeRemaining}
          </div>
          
          {/* Live WPM */}
          {isTestActive && !isPaused && liveWpm > 0 && (
            <div className="text-sub">
              <span className="text-xl sm:text-2xl md:text-3xl text-text">{liveWpm}</span>
              <span className="text-xs md:text-sm ml-1">wpm</span>
            </div>
          )}
        </div>

        {isTestActive && (
          <div className="flex gap-2 flex-wrap">
            {mode === 'practice' && (
              <button
                onClick={handleFinishPractice}
                className="px-3 py-2 bg-main hover:opacity-80 border-none rounded-lg text-xs md:text-sm cursor-pointer font-mono transition-opacity"
                style={{ color: '#1a1a1a' }}
              >
                finish
              </button>
            )}
            <button
              onClick={() => isPaused ? (resumeTest(), focusInput()) : pauseTest()}
              className="px-3 py-2 bg-bg-sub hover:bg-border border border-border rounded-lg text-xs md:text-sm text-text cursor-pointer font-mono transition-colors"
            >
              {isPaused ? 'resume' : 'pause'}
            </button>
            <button
              onClick={() => { resetTest(); onExit(); focusInput(); }}
              className="px-3 py-2 bg-bg-sub hover:bg-border border border-border rounded-lg text-xs md:text-sm text-sub hover:text-text cursor-pointer font-mono transition-colors"
            >
              restart
            </button>
            <button
              onClick={() => { resetTest(); onExit(); }}
              className="px-3 py-2 bg-transparent hover:bg-error/20 border border-border rounded-lg text-xs md:text-sm text-sub hover:text-error cursor-pointer font-mono transition-colors"
            >
              exit
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isTestActive && (
        <div className="h-1 bg-bg-sub rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-main transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 font-mono px-4"
          style={{ backgroundColor: 'rgba(50, 52, 55, 0.95)' }}
        >
          <div className="text-center">
            <p className="text-3xl md:text-5xl text-main mb-4 md:mb-6">paused</p>
            <p className="text-sub text-sm md:text-base mb-6 md:mb-8">
              {mode === 'practice' 
                ? `elapsed: ${formatTime(practiceTime)}`
                : `time remaining: ${timeRemaining}s`
              }
            </p>
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
              <button
                onClick={() => { resumeTest(); focusInput(); }}
                className="px-6 py-3 bg-main hover:opacity-80 border-none rounded-lg text-sm md:text-base font-medium cursor-pointer font-mono transition-opacity"
                style={{ color: '#1a1a1a' }}
              >
                resume
              </button>
              <button
                onClick={() => { resetTest(); onExit(); }}
                className="px-6 py-3 bg-transparent hover:bg-bg-sub border border-border rounded-lg text-sm md:text-base text-sub hover:text-text cursor-pointer font-mono transition-colors"
              >
                exit
              </button>
            </div>
            <p className="text-sub/50 text-xs mt-6 md:mt-8 hidden md:block">
              press space to resume - esc to exit
            </p>
          </div>
        </div>
      )}

      {/* Code Box */}
      <div
        onClick={focusInput}
        className="bg-bg-sub rounded-xl p-4 md:p-8 min-h-[180px] sm:min-h-[220px] md:min-h-[300px] cursor-text border border-border relative overflow-x-auto"
      >
        <pre className="font-mono text-xs sm:text-sm md:text-base leading-relaxed md:leading-loose m-0 whitespace-pre-wrap break-words">
          {currentSnippet.split('').map((char, i) => {
            const isTyped = i < userInput.length;
            const isCorrect = isTyped && userInput[i] === char;
            const isIncorrect = isTyped && userInput[i] !== char;
            const isCurrent = i === userInput.length;
            
            let style: React.CSSProperties = {};
            if (isCorrect) {
              style.color = 'var(--color-text)';
            } else if (isIncorrect) {
              style.color = 'var(--color-error)';
            } else {
              style.color = 'var(--color-sub)';
              style.opacity = 0.5;
            }
            
            return (
              <span 
                key={i} 
                style={style}
                className={isCurrent && !isPaused ? 'caret' : ''}
              >
                {char}
              </span>
            );
          })}
        </pre>

        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isTestComplete || isPaused}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="absolute top-0 left-0 w-full h-full opacity-0 resize-none cursor-text"
        />
      </div>

      {/* Hints and Instructions */}
      {!isTestActive && !isTestComplete && (
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-xs md:text-sm text-sub font-mono mb-3">
            {mode === 'practice' 
              ? 'tap and start typing - no timer'
              : 'tap and start typing'
            }
          </p>
          
          {/* Keyboard shortcuts hint - hide on mobile */}
          {showHints && (
            <div className="hidden sm:flex flex-wrap gap-3 justify-center text-xs text-sub/70">
              <span className="px-2 py-1 bg-bg-sub rounded">Tab → 4 spaces</span>
              <span className="px-2 py-1 bg-bg-sub rounded">Enter → new line</span>
              <span className="px-2 py-1 bg-bg-sub rounded">Esc → exit</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
