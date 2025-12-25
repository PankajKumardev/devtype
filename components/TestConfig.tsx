'use client';

import { useState, useEffect, useRef } from 'react';
import { useTypingStore, TestMode } from '@/store/typingStore';
import { languages, Language } from '@/lib/snippets';

interface TestConfigProps {
  onNewSnippet: () => void;
}

const presetDurations = [15, 30, 60, 120];

export default function TestConfig({ onNewSnippet }: TestConfigProps) {
  const { duration, language, mode, setDuration, setLanguage, setMode, isTestActive, resetTest } = useTypingStore();
  const [showCustom, setShowCustom] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isTestActive) return null;

  const handleDurationChange = (d: number) => {
    setDuration(d);
    resetTest();
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    let time = parseInt(customTime);
    if (isNaN(time) || time < 5) time = 5;
    if (time > 300) time = 300;
    setDuration(time);
    resetTest();
    setShowCustom(false);
    setCustomTime('');
  };

  const handleLanguageChange = (lang: Language | 'all') => {
    setLanguage(lang);
    setLangOpen(false);
    onNewSnippet();
  };

  const handleModeChange = (newMode: TestMode) => {
    setMode(newMode);
    resetTest();
  };

  const isPreset = presetDurations.includes(duration);

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 mb-6 md:mb-10 font-mono text-sm px-4">
      {/* Mode Toggle */}
      <div className="flex gap-1 items-center bg-bg-sub rounded-lg p-1">
        <button
          onClick={() => handleModeChange('timed')}
          className={`px-3 md:px-4 py-2 rounded-md border-none cursor-pointer font-mono text-xs md:text-sm transition-colors
            ${mode === 'timed' ? 'bg-bg text-main' : 'bg-transparent text-sub hover:text-text'}`}
        >
          timed
        </button>
        <button
          onClick={() => handleModeChange('practice')}
          className={`px-3 md:px-4 py-2 rounded-md border-none cursor-pointer font-mono text-xs md:text-sm transition-colors
            ${mode === 'practice' ? 'bg-bg text-main' : 'bg-transparent text-sub hover:text-text'}`}
        >
          practice
        </button>
      </div>

      {/* Duration and Language Row */}
      <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
        {/* Duration buttons - only show in timed mode */}
        {mode === 'timed' && (
          <div className="flex gap-1 md:gap-2 items-center flex-wrap justify-center">
            {presetDurations.map((d) => (
              <button
                key={d}
                onClick={() => handleDurationChange(d)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border-none cursor-pointer font-mono text-xs md:text-sm transition-colors
                  ${duration === d ? 'bg-bg-sub text-main' : 'bg-transparent text-sub hover:text-text hover:bg-bg-sub/50'}`}
              >
                {d}s
              </button>
            ))}
            
            {showCustom ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="sec"
                  min={5}
                  max={300}
                  className="w-14 md:w-16 px-2 md:px-3 py-1.5 md:py-2 bg-bg-sub border border-border rounded-lg text-text font-mono text-xs md:text-sm text-center"
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  autoFocus
                />
                <button
                  onClick={handleCustomSubmit}
                  className="px-2 md:px-3 py-1.5 md:py-2 bg-main hover:bg-yellow-600 border-none rounded-lg cursor-pointer text-bg font-mono text-xs md:text-sm transition-colors"
                >
                  ok
                </button>
                <button
                  onClick={() => setShowCustom(false)}
                  className="px-2 md:px-3 py-1.5 md:py-2 bg-transparent hover:bg-bg-sub border-none rounded-lg cursor-pointer text-sub hover:text-text font-mono text-xs md:text-sm transition-colors"
                >
                  x
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustom(true)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border-none cursor-pointer font-mono text-xs md:text-sm transition-colors
                  ${!isPreset ? 'bg-bg-sub text-main' : 'bg-transparent text-sub hover:text-text hover:bg-bg-sub/50'}`}
              >
                {!isPreset ? `${duration}s` : 'custom'}
              </button>
            )}
          </div>
        )}

        {mode === 'practice' && (
          <p className="text-sub text-xs md:text-sm">no timer - focus on accuracy</p>
        )}

        {/* Divider */}
        <div className="w-px h-4 md:h-5 bg-border" />

        {/* Custom Language Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className={`px-3 md:px-4 py-1.5 md:py-2 bg-bg-sub rounded-lg font-mono text-xs md:text-sm cursor-pointer border-none flex items-center gap-2 transition-colors
              ${language === 'all' ? 'text-sub' : 'text-main'}`}
          >
            {language === 'all' ? 'all languages' : language}
            <span className="text-sub text-xs">▼</span>
          </button>
          
          {langOpen && (
            <div className="absolute top-full left-0 mt-2 bg-bg-sub rounded-lg py-2 min-w-[140px] z-50 border border-border">
              <button
                onClick={() => handleLanguageChange('all')}
                className={`w-full text-left px-4 py-2 text-xs md:text-sm font-mono border-none cursor-pointer transition-colors
                  ${language === 'all' ? 'text-main bg-bg' : 'text-sub hover:text-text hover:bg-bg bg-transparent'}`}
              >
                all languages
              </button>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full text-left px-4 py-2 text-xs md:text-sm font-mono border-none cursor-pointer transition-colors
                    ${language === lang ? 'text-main bg-bg' : 'text-sub hover:text-text hover:bg-bg bg-transparent'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
