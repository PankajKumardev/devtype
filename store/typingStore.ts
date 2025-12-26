import { create } from 'zustand';
import { Language } from '@/lib/snippets';

export type TestMode = 'timed' | 'practice';

export interface ReplayFrame {
  input: string;
  timestamp: number; // ms since start
}

interface TypingState {
  // Config
  duration: number;
  language: Language;
  mode: TestMode;
  
  // Test state
  isTestActive: boolean;
  isTestComplete: boolean;
  isPaused: boolean;
  timeRemaining: number;
  currentSnippet: string;
  userInput: string;
  
  // Stats
  currentIndex: number;
  correctChars: number;
  incorrectChars: number;
  totalKeystrokes: number;
  keyErrors: Record<string, number>;
  
  // Results
  wpm: number;
  accuracy: number;
  
  // Live stats
  liveWpm: number;
  startTime: number | null;
  
  // Streak
  dailyStreak: number;
  lastPracticeDate: string | null;
  
  // Personal best
  personalBest: number;
  isNewPersonalBest: boolean;
  
  // Replay
  replayFrames: ReplayFrame[];
  
  // WPM History for graph
  wpmHistory: { second: number; wpm: number; raw: number; errors: number }[];
  
  // Actions
  setDuration: (duration: number) => void;
  setLanguage: (language: Language) => void;
  setMode: (mode: TestMode) => void;
  setSnippet: (snippet: string) => void;
  startTest: () => void;
  pauseTest: () => void;
  resumeTest: () => void;
  resetTest: () => void;
  updateInput: (input: string) => void;
  tick: () => void;
  calculateResults: () => void;
  updateLiveWpm: () => void;
  loadStreak: () => void;
  updateStreak: () => void;
  loadPersonalBest: () => void;
  loadSettings: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  // Initial state
  duration: 30,
  language: 'typescript',
  mode: 'timed',
  isTestActive: false,
  isTestComplete: false,
  isPaused: false,
  timeRemaining: 30,
  currentSnippet: '',
  userInput: '',
  currentIndex: 0,
  correctChars: 0,
  incorrectChars: 0,
  totalKeystrokes: 0,
  keyErrors: {},
  wpm: 0,
  accuracy: 0,
  liveWpm: 0,
  startTime: null,
  dailyStreak: 0,
  lastPracticeDate: null,
  personalBest: 0,
  isNewPersonalBest: false,
  replayFrames: [],
  wpmHistory: [],

  setDuration: (duration) => {
    set({ duration, timeRemaining: duration });
    if (typeof window !== 'undefined') {
      localStorage.setItem('devtype-duration', duration.toString());
    }
  },
  setLanguage: (language) => {
    set({ language });
    if (typeof window !== 'undefined') {
      localStorage.setItem('devtype-language', language);
    }
  },
  setMode: (mode) => {
    set({ mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('devtype-mode', mode);
    }
  },
  setSnippet: (snippet) => set({ currentSnippet: snippet, userInput: '', currentIndex: 0 }),

  startTest: () => set({ 
    isTestActive: true, 
    isTestComplete: false, 
    isPaused: false,
    startTime: Date.now(),
    liveWpm: 0,
  }),

  pauseTest: () => set({ isPaused: true }),
  resumeTest: () => set({ isPaused: false }),

  resetTest: () => {
    const { duration } = get();
    set({
      isTestActive: false,
      isTestComplete: false,
      isPaused: false,
      timeRemaining: duration,
      userInput: '',
      currentIndex: 0,
      correctChars: 0,
      incorrectChars: 0,
      totalKeystrokes: 0,
      keyErrors: {},
      wpm: 0,
      accuracy: 0,
      liveWpm: 0,
      startTime: null,
      isNewPersonalBest: false,
      replayFrames: [],
      wpmHistory: [],
    });
  },

  updateInput: (input) => {
    const { currentSnippet, userInput, keyErrors, startTime, replayFrames } = get();
    
    // Record frame for replay
    const timestamp = startTime ? Date.now() - startTime : 0;
    const newFrames = [...replayFrames, { input, timestamp }];
    
    // Handle multiple characters (e.g., auto-indentation after Enter)
    if (input.length > userInput.length) {
      const newCharsCount = input.length - userInput.length;
      let correct = 0;
      let incorrect = 0;
      const newKeyErrors = { ...keyErrors };
      
      for (let i = 0; i < newCharsCount; i++) {
        const charIndex = userInput.length + i;
        const expectedChar = currentSnippet[charIndex];
        const typedChar = input[charIndex];
        
        if (typedChar === expectedChar) {
          correct++;
        } else {
          incorrect++;
          if (expectedChar) {
            newKeyErrors[expectedChar] = (newKeyErrors[expectedChar] || 0) + 1;
          }
        }
      }
      
      set({
        userInput: input,
        currentIndex: input.length,
        correctChars: get().correctChars + correct,
        incorrectChars: get().incorrectChars + incorrect,
        totalKeystrokes: get().totalKeystrokes + newCharsCount,
        keyErrors: newKeyErrors,
        replayFrames: newFrames,
      });
    } else {
      // Backspace - just update position
      set({ userInput: input, currentIndex: input.length, replayFrames: newFrames });
    }
    
    // Update live WPM
    get().updateLiveWpm();
  },

  updateLiveWpm: () => {
    const { startTime, correctChars, incorrectChars } = get();
    if (!startTime) return;
    
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    if (elapsedMinutes < 0.05) return; // Wait at least 3 seconds
    
    // Net characters = correct - errors (penalty for mistakes)
    const netChars = Math.max(0, correctChars - incorrectChars);
    const liveWpm = Math.round((netChars / 5) / elapsedMinutes);
    set({ liveWpm: Math.min(liveWpm, 300) }); // Cap at 300 WPM
  },

  tick: () => {
    const { timeRemaining, calculateResults, duration, startTime, correctChars, incorrectChars, totalKeystrokes, wpmHistory } = get();
    
    // Record WPM history point
    if (startTime) {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const elapsedMinutes = elapsedSeconds / 60;
      
      if (elapsedMinutes > 0) {
        const netChars = Math.max(0, correctChars - incorrectChars);
        const wpm = Math.round((netChars / 5) / elapsedMinutes);
        const raw = Math.round((totalKeystrokes / 5) / elapsedMinutes);
        
        // Only add if it's a new second
        if (!wpmHistory.find(h => h.second === elapsedSeconds)) {
          set({ 
            wpmHistory: [...wpmHistory, { 
              second: elapsedSeconds, 
              wpm: Math.min(wpm, 300),
              raw: Math.min(raw, 300),
              errors: incorrectChars
            }]
          });
        }
      }
    }
    
    if (timeRemaining <= 1) {
      set({ timeRemaining: 0 });
      calculateResults();
    } else {
      set({ timeRemaining: timeRemaining - 1 });
      get().updateLiveWpm();
    }
  },

  calculateResults: () => {
    const { correctChars, incorrectChars, totalKeystrokes, duration, timeRemaining, mode, personalBest } = get();
    
    const timeElapsed = mode === 'timed' 
      ? duration - timeRemaining 
      : (Date.now() - (get().startTime || Date.now())) / 1000;
    
    const minutes = timeElapsed / 60;
    
    // Net characters = correct - errors (penalty for mistakes)
    const netChars = Math.max(0, correctChars - incorrectChars);
    const wpm = minutes > 0 ? Math.round((netChars / 5) / minutes) : 0;
    
    const accuracy = totalKeystrokes > 0 
      ? Math.round((correctChars / totalKeystrokes) * 100) 
      : 0;
    
    // Check for personal best
    const isNewPersonalBest = wpm > personalBest && mode === 'timed';
    if (isNewPersonalBest) {
      localStorage.setItem('devtype-personal-best', wpm.toString());
    }

    set({ 
      wpm, 
      accuracy, 
      isTestActive: false,
      isTestComplete: true,
      isNewPersonalBest,
      personalBest: isNewPersonalBest ? wpm : personalBest,
    });
    
    // Update streak
    get().updateStreak();
  },

  loadStreak: () => {
    if (typeof window === 'undefined') return;
    
    const savedStreak = localStorage.getItem('devtype-streak');
    const savedDate = localStorage.getItem('devtype-last-practice');
    
    if (savedStreak && savedDate) {
      const lastDate = new Date(savedDate).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastDate === today || lastDate === yesterday) {
        set({ dailyStreak: parseInt(savedStreak), lastPracticeDate: savedDate });
      } else {
        // Streak broken
        set({ dailyStreak: 0, lastPracticeDate: null });
        localStorage.removeItem('devtype-streak');
        localStorage.removeItem('devtype-last-practice');
      }
    }
  },

  updateStreak: () => {
    if (typeof window === 'undefined') return;
    
    const { lastPracticeDate, dailyStreak } = get();
    const today = new Date().toDateString();
    const todayISO = new Date().toISOString();
    
    if (lastPracticeDate) {
      const lastDate = new Date(lastPracticeDate).toDateString();
      if (lastDate !== today) {
        // New day, increment streak
        const newStreak = dailyStreak + 1;
        set({ dailyStreak: newStreak, lastPracticeDate: todayISO });
        localStorage.setItem('devtype-streak', newStreak.toString());
        localStorage.setItem('devtype-last-practice', todayISO);
      }
    } else {
      // First practice
      set({ dailyStreak: 1, lastPracticeDate: todayISO });
      localStorage.setItem('devtype-streak', '1');
      localStorage.setItem('devtype-last-practice', todayISO);
    }
  },

  loadPersonalBest: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('devtype-personal-best');
    if (saved) {
      set({ personalBest: parseInt(saved) });
    }
  },

  loadSettings: () => {
    if (typeof window === 'undefined') return;
    
    const savedDuration = localStorage.getItem('devtype-duration');
    const savedLanguage = localStorage.getItem('devtype-language');
    const savedMode = localStorage.getItem('devtype-mode');
    
    const updates: Partial<TypingState> = {};
    
    if (savedDuration) {
      const duration = parseInt(savedDuration);
      updates.duration = duration;
      updates.timeRemaining = duration;
    }
    
    if (savedLanguage && ['typescript', 'javascript', 'python', 'rust', 'go', 'java', 'cpp'].includes(savedLanguage)) {
      updates.language = savedLanguage as Language;
    }
    
    if (savedMode && (savedMode === 'timed' || savedMode === 'practice')) {
      updates.mode = savedMode as TestMode;
    }
    
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
}));
