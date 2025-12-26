import { create } from 'zustand';

interface LeaderboardEntry {
  rank: number;
  name: string;
  image?: string;
  wpm: number;
  accuracy: number;
  weightedScore?: number;
  language: string;
  duration: number;
}

interface Score {
  _id: string;
  wpm: number;
  accuracy: number;
  language: string;
  duration: number;
  timestamp: string;
}

interface DashboardData {
  scores: Score[];
  stats: {
    testsCompleted: number;
    bestWpm: number;
    avgAccuracy: number;
  };
  dailyStreak: number;
  lastFetched: number;
}

interface LeaderboardData {
  [key: string]: {
    entries: LeaderboardEntry[];
    lastFetched: number;
  };
}

interface DataCacheState {
  dashboard: DashboardData | null;
  leaderboard: LeaderboardData;
  
  // Actions
  setDashboardData: (data: Omit<DashboardData, 'lastFetched'>) => void;
  setLeaderboardData: (language: string, entries: LeaderboardEntry[]) => void;
  invalidateDashboard: () => void;
  invalidateLeaderboard: () => void;
  shouldRefresh: (lastFetched: number) => boolean;
}

const CACHE_DURATION = 60000; // 1 minute

export const useDataCache = create<DataCacheState>((set, get) => ({
  dashboard: null,
  leaderboard: {},

  setDashboardData: (data) => {
    set({
      dashboard: {
        ...data,
        lastFetched: Date.now(),
      },
    });
  },

  setLeaderboardData: (language, entries) => {
    set((state) => ({
      leaderboard: {
        ...state.leaderboard,
        [language]: {
          entries,
          lastFetched: Date.now(),
        },
      },
    }));
  },

  invalidateDashboard: () => {
    set({ dashboard: null });
  },

  invalidateLeaderboard: () => {
    set({ leaderboard: {} });
  },

  shouldRefresh: (lastFetched) => {
    return Date.now() - lastFetched > CACHE_DURATION;
  },
}));
