'use client';

import { useTypingStore } from '@/store/typingStore';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useDataCache } from '@/store/dataCacheStore';
import ReplayModal from './ReplayModal';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Scatter, ComposedChart } from 'recharts';

interface ResultsModalProps {
  onRestart: () => void;
  snippetsCompleted: number;
}

export default function ResultsModal({ onRestart, snippetsCompleted }: ResultsModalProps) {
  const { 
    isTestComplete, wpm, accuracy, language, duration, mode, keyErrors, 
    isNewPersonalBest, dailyStreak, replayFrames, wpmHistory, correctChars, incorrectChars, totalKeystrokes
  } = useTypingStore();
  const { data: session } = useSession();
  const { invalidateDashboard, invalidateLeaderboard } = useDataCache();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveAttempted = useRef(false);
  const confettiTriggered = useRef(false);
  const [showReplay, setShowReplay] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const copyAreaRef = useRef<HTMLDivElement>(null);

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
        e.preventDefault();
        e.stopPropagation();
        // Small delay to prevent the key from being registered in the next test
        setTimeout(() => {
          onRestart();
        }, 50);
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isTestComplete, onRestart]);

  const copyToClipboard = async () => {
    if (!copyAreaRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(copyAreaRef.current, {
        backgroundColor: '#323437',
        scale: 2,
      });
      
      canvas.toBlob(async (blob: Blob | null) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          } catch {
            // Fallback: download the image
            const link = document.createElement('a');
            link.download = `devtype-${wpm}wpm-${accuracy}acc.png`;
            link.href = canvas.toDataURL();
            link.click();
          }
        }
      });
    } catch (error) {
      console.error('Error copying image:', error);
    }
  };

  if (!isTestComplete) return null;

  const problemKeys = Object.entries(keyErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const rawWpm = totalKeystrokes > 0 ? Math.round((totalKeystrokes / 5) / (duration / 60)) : 0;

  return (
    <div 
      onClick={onRestart}
      className="fixed inset-0 bg-bg flex items-center justify-center z-50 cursor-pointer font-mono"
    >
      {/* Toast Notification */}
      {showToast && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-main rounded-lg text-sm font-medium shadow-lg"
          style={{ color: '#1a1a1a' }}
        >
          ✓ Image copied to clipboard
        </div>
      )}
      
      <div ref={resultsRef} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl mx-auto px-6 py-8 bg-bg">
        {/* Personal Best Banner */}
        {isNewPersonalBest && (
          <div className="text-center mb-4">
            <span className="text-main text-sm">🏆 new personal best!</span>
          </div>
        )}

        {/* Streak */}
        {dailyStreak > 0 && (
          <p className="text-main text-sm text-center mb-4">{dailyStreak} day streak</p>
        )}

        {/* HIDDEN - For Image Copy Only (smaller sizes) */}
        <div ref={copyAreaRef} className="absolute -left-[9999px] bg-bg p-4" style={{ width: '700px' }}>
          <div className="flex gap-6 mb-4">
            <div className="flex flex-col justify-center flex-shrink-0" style={{ width: '60px' }}>
              <p className="text-sub" style={{ fontSize: '10px' }}>wpm</p>
              <p className="text-main leading-none" style={{ fontSize: '24px' }}>{wpm}</p>
              <p className="text-sub" style={{ fontSize: '10px', marginTop: '8px' }}>acc</p>
              <p className="text-main leading-none" style={{ fontSize: '20px' }}>{accuracy}%</p>
            </div>
            {wpmHistory.length > 1 && (
              <div className="flex-1 min-w-0">
                <div style={{ height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={wpmHistory} margin={{ top: 10, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" vertical={false} />
                      <XAxis dataKey="second" tick={{ fontSize: 9, fill: '#646669' }} axisLine={{ stroke: '#4a4a4a' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#646669' }} axisLine={{ stroke: '#4a4a4a' }} tickLine={false} width={25} domain={[0, 'auto']} />
                      <Line type="monotone" dataKey="raw" stroke="#646669" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="wpm" stroke="#e2b714" strokeWidth={2} dot={false} />
                      <Scatter dataKey="errors" fill="#ca4754" shape={((props: { cx?: number; payload?: { errors: number } }) => {
                        const { cx, payload } = props;
                        if (!cx || !payload?.errors || payload.errors === 0) return null;
                        return (<g><line x1={cx-2} y1={4} x2={cx+2} y2={8} stroke="#ca4754" strokeWidth={1}/><line x1={cx+2} y1={4} x2={cx-2} y2={8} stroke="#ca4754" strokeWidth={1}/></g>);
                      }) as any} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-1" style={{ fontSize: '9px' }}>
                  <span className="text-sub"><span style={{ color: '#e2b714' }}>—</span> wpm</span>
                  <span className="text-sub"><span style={{ color: '#646669' }}>—</span> raw</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-start gap-x-6 gap-y-2" style={{ fontSize: '11px' }}>
            <div><p className="text-sub">test type</p><p className="text-main">{mode === 'practice' ? 'practice' : 'time ' + duration}</p><p className="text-main">{language}</p></div>
            <div><p className="text-sub">raw</p><p className="text-text">{rawWpm}</p></div>
            <div><p className="text-sub">characters</p><p className="text-text">{correctChars}/{incorrectChars}/{correctChars + incorrectChars}</p></div>
            <div><p className="text-sub">time</p><p className="text-text">{duration}s</p></div>
          </div>
        </div>

        {/* VISIBLE - UI Display (larger sizes) */}
        <div className="bg-bg p-4">
          <div className="flex gap-8 mb-6">
            <div className="flex flex-col justify-center flex-shrink-0" style={{ width: '100px' }}>
              <p className="text-sub text-xs">wpm</p>
              <p className="text-5xl text-main leading-none">{wpm}</p>
              <p className="text-sub text-xs mt-4">acc</p>
              <p className="text-4xl text-main leading-none">{accuracy}%</p>
            </div>
            {wpmHistory.length > 1 && (
              <div className="flex-1 min-w-0">
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={wpmHistory} margin={{ top: 10, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" vertical={false} />
                      <XAxis dataKey="second" tick={{ fontSize: 10, fill: '#646669' }} axisLine={{ stroke: '#4a4a4a' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#646669' }} axisLine={{ stroke: '#4a4a4a' }} tickLine={false} width={30} domain={[0, 'auto']} />
                      <Line type="monotone" dataKey="raw" stroke="#646669" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="wpm" stroke="#e2b714" strokeWidth={2} dot={false} />
                      <Scatter dataKey="errors" fill="#ca4754" shape={((props: { cx?: number; payload?: { errors: number } }) => {
                        const { cx, payload } = props;
                        if (!cx || !payload?.errors || payload.errors === 0) return null;
                        return (<g><line x1={cx-2} y1={4} x2={cx+2} y2={8} stroke="#ca4754" strokeWidth={1}/><line x1={cx+2} y1={4} x2={cx-2} y2={8} stroke="#ca4754" strokeWidth={1}/></g>);
                      }) as any} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-2 text-xs text-sub">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5" style={{ backgroundColor: '#e2b714' }}></div><span>wpm</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5" style={{ backgroundColor: '#646669' }}></div><span>raw</span></div>
                </div>
              </div>
            )}
          </div>
          {/* Bottom Stats Row */}
          <div className="flex flex-wrap justify-start gap-x-8 gap-y-3 text-xs">
            <div><p className="text-sub">test type</p><p className="text-main">{mode === 'practice' ? 'practice' : 'time ' + duration}</p><p className="text-main">{language}</p></div>
            <div><p className="text-sub">raw</p><p className="text-text text-lg">{rawWpm}</p></div>
            <div><p className="text-sub">characters</p><p className="text-text text-lg">{correctChars}/{incorrectChars}/{correctChars + incorrectChars}</p></div>
            <div><p className="text-sub">time</p><p className="text-text text-lg">{duration}s</p></div>
          </div>
        </div>

        {/* Bottom content */}
        <div className="pl-4">
          {/* Problem Keys */}
          {problemKeys.length > 0 && (
            <div className="mb-6">
              <p className="text-sub text-xs mb-2">missed keys</p>
              <div className="flex gap-2 flex-wrap">
                {problemKeys.map(([key, count]) => (
                  <div 
                    key={key}
                    className="px-3 py-2 rounded-lg bg-bg-sub border border-border text-center min-w-[40px]"
                  >
                    <span className="text-sm text-text">
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
            <p className={`text-xs mb-4 ${
              saveStatus === 'saved' ? 'text-main' : 
              saveStatus === 'error' ? 'text-error' : 
              'text-sub'
            }`}>
              {saveStatus === 'saving' && 'saving...'}
              {saveStatus === 'saved' && 'saved to leaderboard'}
              {saveStatus === 'error' && 'failed to save'}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyToClipboard}
              className="px-5 py-2.5 bg-bg-sub hover:bg-border border border-border rounded-lg text-sm text-sub hover:text-text cursor-pointer font-mono transition-colors"
            >
               copy image
            </button>
            {replayFrames.length > 0 && (
              <button
                onClick={() => setShowReplay(true)}
                className="px-5 py-2.5 bg-bg-sub hover:bg-border border border-border rounded-lg text-sm text-sub hover:text-text cursor-pointer font-mono transition-colors"
              >
                ▶ replay
              </button>
            )}
            <button
              onClick={onRestart}
              className="px-6 py-2.5 bg-main hover:opacity-80 border-none rounded-lg text-sm font-medium cursor-pointer font-mono transition-opacity"
              style={{ color: '#1a1a1a' }}
            >
              {mode === 'practice' ? 'continue' : 'next test'}
            </button>
          </div>

          {!session && mode === 'timed' && (
            <p className="text-sub text-xs mt-4">login to save scores</p>
          )}

          <p className="text-sub/40 text-xs mt-6 hidden sm:block">
            press enter to continue
          </p>
        </div>
      </div>

      {/* Replay Modal */}
      <ReplayModal isOpen={showReplay} onClose={() => setShowReplay(false)} />
    </div>
  );
}

