import { create } from 'zustand';
import { Language } from '@/lib/snippets';

export type TestMode = 'timed' | 'practice';

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
    });
  },

  updateInput: (input) => {
    const { currentSnippet, userInput, keyErrors } = get();
    const newIndex = input.length;
    const lastCharIndex = newIndex - 1;
    
    // Only process if adding characters (not backspace)
    if (input.length > userInput.length && lastCharIndex >= 0) {
      const expectedChar = currentSnippet[lastCharIndex];
      const typedChar = input[lastCharIndex];
      
      if (typedChar !== expectedChar) {
        // Wrong character - track error
        const newKeyErrors = { ...keyErrors };
        newKeyErrors[expectedChar] = (newKeyErrors[expectedChar] || 0) + 1;
        
        set({
          userInput: input,
          currentIndex: newIndex,
          incorrectChars: get().incorrectChars + 1,
          totalKeystrokes: get().totalKeystrokes + 1,
          keyErrors: newKeyErrors,
        });
      } else {
        // Correct character
        set({
          userInput: input,
          currentIndex: newIndex,
          correctChars: get().correctChars + 1,
          totalKeystrokes: get().totalKeystrokes + 1,
        });
      }
    } else {
      set({ userInput: input, currentIndex: newIndex });
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
    const { timeRemaining, calculateResults } = get();
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
