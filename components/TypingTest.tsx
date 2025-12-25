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
    updateInput,
    tick,
    startTest,
    pauseTest,
    resumeTest,
    resetTest,
    calculateResults,
  } = useTypingStore();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [practiceTime, setPracticeTime] = useState(0);

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
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTestActive, isPaused, resetTest, resumeTest, onExit, focusInput, mode, calculateResults]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isTestComplete || isPaused) return;
    if (!isTestActive) {
      startTest();
      setPracticeTime(0);
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-10 font-mono">
      {/* Timer and Controls */}
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div 
          className="text-4xl md:text-6xl"
          style={{ color: isPaused ? 'var(--color-sub)' : 'var(--color-main)' }}
        >
          {mode === 'practice' ? formatTime(practiceTime) : timeRemaining}
        </div>

        {isTestActive && (
          <div className="flex gap-2 md:gap-3">
            {mode === 'practice' && (
              <button
                onClick={handleFinishPractice}
                className="px-3 md:px-6 py-2 md:py-3 bg-main hover:bg-yellow-600 border-none rounded-lg text-xs md:text-sm text-bg cursor-pointer font-mono transition-colors"
              >
                finish
              </button>
            )}
            <button
              onClick={() => isPaused ? (resumeTest(), focusInput()) : pauseTest()}
              className="px-3 md:px-6 py-2 md:py-3 bg-bg-sub hover:bg-border border border-border rounded-lg text-xs md:text-sm text-text hover:text-main cursor-pointer font-mono transition-colors"
            >
              {isPaused ? 'resume' : 'pause'}
            </button>
            <button
              onClick={() => { resetTest(); onExit(); }}
              className="px-3 md:px-6 py-2 md:py-3 bg-transparent hover:bg-error/20 border border-border rounded-lg text-xs md:text-sm text-sub hover:text-error cursor-pointer font-mono transition-colors"
            >
              exit
            </button>
          </div>
        )}
      </div>

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
            <div className="flex gap-3 md:gap-4 justify-center">
              <button
                onClick={() => { resumeTest(); focusInput(); }}
                className="px-6 md:px-8 py-3 md:py-3.5 bg-main hover:bg-yellow-600 border-none rounded-lg text-sm md:text-base font-medium text-bg cursor-pointer font-mono transition-colors"
              >
                resume
              </button>
              <button
                onClick={() => { resetTest(); onExit(); }}
                className="px-6 md:px-8 py-3 md:py-3.5 bg-transparent hover:bg-bg-sub border border-border rounded-lg text-sm md:text-base text-sub hover:text-text cursor-pointer font-mono transition-colors"
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
        className="bg-bg-sub rounded-xl p-4 md:p-8 min-h-[200px] md:min-h-[300px] cursor-text border border-border relative"
      >
        <pre className="font-mono text-sm md:text-base leading-relaxed md:leading-loose m-0 whitespace-pre-wrap break-words">
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

      {!isTestActive && !isTestComplete && (
        <p className="text-center mt-4 md:mt-6 text-xs md:text-sm text-sub font-mono">
          {mode === 'practice' 
            ? 'tap and start typing - no timer'
            : 'tap and start typing'
          }
        </p>
      )}
    </div>
  );
}
