import { create } from 'zustand';
import { Language } from '@/lib/snippets';

export type TestMode = 'timed' | 'practice';

export interface TypingState {
  // Test configuration
  duration: number;
  language: Language | 'all';
  mode: TestMode;
  
  // Test state
  isTestActive: boolean;
  isTestComplete: boolean;
  isPaused: boolean;
  timeRemaining: number;
  
  // Typing data
  currentSnippet: string;
  userInput: string;
  currentIndex: number;
  correctChars: number;
  incorrectChars: number;
  totalKeystrokes: number;
  
  // Keyboard heatmap data
  keyErrors: Record<string, number>;
  
  // Results
  wpm: number;
  accuracy: number;
  
  // Actions
  setDuration: (duration: number) => void;
  setLanguage: (language: Language | 'all') => void;
  setMode: (mode: TestMode) => void;
  setCurrentSnippet: (snippet: string) => void;
  startTest: () => void;
  updateInput: (input: string) => void;
  tick: () => void;
  resetTest: () => void;
  clearInput: () => void;
  calculateResults: () => void;
  pauseTest: () => void;
  resumeTest: () => void;
  recordKeyError: (key: string) => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  // Initial state
  duration: 30,
  language: 'all',
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

  // Actions
  setDuration: (duration) => set({ duration, timeRemaining: duration }),
  
  setLanguage: (language) => set({ language }),
  
  setMode: (mode) => set({ mode }),
  
  setCurrentSnippet: (snippet) => set({ currentSnippet: snippet }),
  
  startTest: () => set({ 
    isTestActive: true, 
    isTestComplete: false,
    isPaused: false,
    userInput: '',
    currentIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    totalKeystrokes: 0,
    keyErrors: {},
    timeRemaining: get().duration,
  }),
  
  pauseTest: () => set({ isPaused: true }),
  
  resumeTest: () => set({ isPaused: false }),
  
  recordKeyError: (key) => {
    const state = get();
    const newErrors = { ...state.keyErrors };
    newErrors[key.toLowerCase()] = (newErrors[key.toLowerCase()] || 0) + 1;
    set({ keyErrors: newErrors });
  },
  
  updateInput: (input) => {
    const state = get();
    const snippet = state.currentSnippet;
    
    if (state.isPaused) return;
    
    if (!state.isTestActive) {
      set({ isTestActive: true });
    }
    
    let correct = 0;
    let incorrect = 0;
    
    for (let i = 0; i < input.length; i++) {
      if (input[i] === snippet[i]) {
        correct++;
      } else {
        incorrect++;
        // Record the error
        if (snippet[i] && input.length > state.userInput.length) {
          get().recordKeyError(snippet[i]);
        }
      }
    }
    
    set({
      userInput: input,
      currentIndex: input.length,
      correctChars: correct,
      incorrectChars: incorrect,
      totalKeystrokes: state.totalKeystrokes + Math.abs(input.length - state.userInput.length),
    });
  },
  
  tick: () => {
    const state = get();
    if (state.isPaused || state.mode === 'practice') return;
    
    const newTime = state.timeRemaining - 1;
    
    if (newTime <= 0) {
      get().calculateResults();
      set({ 
        timeRemaining: 0, 
        isTestActive: false, 
        isTestComplete: true 
      });
    } else {
      set({ timeRemaining: newTime });
    }
  },
  
  calculateResults: () => {
    const state = get();
    const timeElapsed = state.mode === 'practice' 
      ? 1 // Assume 1 minute for practice mode
      : (state.duration - state.timeRemaining) / 60;
    const totalChars = state.correctChars;
    const wpm = timeElapsed > 0 ? Math.round((totalChars / 5) / timeElapsed) : 0;
    const accuracy = state.totalKeystrokes > 0 
      ? Math.round((state.correctChars / state.totalKeystrokes) * 100) 
      : 100;
    
    set({ wpm, accuracy });
  },
  
  clearInput: () => {
    set({
      userInput: '',
      currentIndex: 0,
    });
  },
  
  resetTest: () => {
    const state = get();
    set({
      isTestActive: false,
      isTestComplete: false,
      isPaused: false,
      timeRemaining: state.duration,
      userInput: '',
      currentIndex: 0,
      correctChars: 0,
      incorrectChars: 0,
      totalKeystrokes: 0,
      keyErrors: {},
      wpm: 0,
      accuracy: 0,
    });
  },
}));
