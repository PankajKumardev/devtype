'use client';

import { useState, useEffect, useRef } from 'react';
import { useTypingStore } from '@/store/typingStore';

interface ReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReplayModal({ isOpen, onClose }: ReplayModalProps) {
  const { currentSnippet, replayFrames, wpm, accuracy } = useTypingStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [displayInput, setDisplayInput] = useState('');
  const [speed, setSpeed] = useState(1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentFrameIndex(0);
      setDisplayInput('');
      setIsPlaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying || currentFrameIndex >= replayFrames.length) {
      return;
    }

    const currentFrame = replayFrames[currentFrameIndex];
    const nextFrame = replayFrames[currentFrameIndex + 1];
    
    setDisplayInput(currentFrame.input);

    if (nextFrame) {
      const delay = (nextFrame.timestamp - currentFrame.timestamp) / speed;
      timeoutRef.current = setTimeout(() => {
        setCurrentFrameIndex(prev => prev + 1);
      }, Math.max(delay, 10));
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentFrameIndex, replayFrames, speed]);

  const handlePlay = () => {
    if (currentFrameIndex >= replayFrames.length - 1) {
      setCurrentFrameIndex(0);
      setDisplayInput('');
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    setDisplayInput('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  if (!isOpen) return null;

  // Calculate current WPM based on replay position
  const currentTime = replayFrames[currentFrameIndex]?.timestamp || 0;
  const currentWpm = currentTime > 0 
    ? Math.round((displayInput.length / 5) / (currentTime / 60000))
    : 0;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-bg"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl mx-auto px-4 md:px-10 font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with stats - same as typing test */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-8">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Live WPM */}
            <div className="text-sub">
              <span className="text-3xl sm:text-4xl md:text-6xl text-main">{currentWpm}</span>
              <span className="text-xs md:text-sm ml-1">wpm</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="px-3 py-2 bg-main hover:opacity-80 border-none rounded-lg text-xs md:text-sm cursor-pointer font-mono transition-opacity"
                style={{ color: '#1a1a1a' }}
              >
                ▶ play
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-3 py-2 bg-main hover:opacity-80 border-none rounded-lg text-xs md:text-sm cursor-pointer font-mono transition-opacity"
                style={{ color: '#1a1a1a' }}
              >
                ⏸ pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-bg-sub hover:bg-border border border-border rounded-lg text-xs md:text-sm text-sub hover:text-text cursor-pointer font-mono transition-colors"
            >
              ↺ reset
            </button>
            
            {/* Speed buttons */}
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-2 rounded-lg text-xs md:text-sm cursor-pointer font-mono transition-colors border ${
                  speed === s 
                    ? 'bg-main border-main' 
                    : 'bg-bg-sub text-sub hover:text-text border-border'
                }`}
                style={speed === s ? { color: '#1a1a1a' } : {}}
              >
                {s}x
              </button>
            ))}
            
            <button
              onClick={onClose}
              className="px-3 py-2 bg-transparent hover:bg-error/20 border border-border rounded-lg text-xs md:text-sm text-sub hover:text-error cursor-pointer font-mono transition-colors"
            >
              close
            </button>
          </div>
        </div>

        {/* Code display - exact same as typing test */}
        <div 
          className="relative bg-bg-sub rounded-2xl p-4 md:p-8 min-h-[200px] md:min-h-[300px] overflow-auto"
        >
          <pre className="text-sm md:text-lg leading-relaxed whitespace-pre-wrap break-words font-mono m-0">
            {currentSnippet.split('').map((char, index) => {
              const isTyped = index < displayInput.length;
              const isCorrect = isTyped && displayInput[index] === char;
              const isIncorrect = isTyped && displayInput[index] !== char;
              const isCurrent = index === displayInput.length;
              
              // Untyped = very faded, correct = full text color, incorrect = error
              let style: React.CSSProperties = { opacity: 0.3, color: 'var(--color-sub)' };
              if (isCorrect) style = { opacity: 1, color: 'var(--color-text)' };
              if (isIncorrect) style = { opacity: 1, color: 'var(--color-error)' };
              
              const displayChar = char === '\n' ? '↵\n' : char === ' ' ? '\u00A0' : char;
              
              return (
                <span key={index} className="relative">
                  {isCurrent && (
                    <span 
                      className="absolute left-0 top-0 w-0.5 h-[1.2em] bg-main animate-pulse"
                      style={{ animation: 'blink 1s step-end infinite' }}
                    />
                  )}
                  <span style={style}>{displayChar}</span>
                </span>
              );
            })}
          </pre>
        </div>

        {/* Bottom info */}
        <div className="mt-4 flex justify-between text-xs text-sub">
          <span>replay • {wpm} wpm • {accuracy}% acc</span>
          <span>{Math.round((displayInput.length / currentSnippet.length) * 100)}% complete</span>
        </div>
      </div>
    </div>
  );
}
