# Performance Improvements - Data Caching

## Changes Made

### 1. Created Zustand Data Cache Store (`store/dataCacheStore.ts`)
- **Cache Duration**: 1 minute (60 seconds)
- **Stores**:
  - Dashboard data (scores, stats, streak)
  - Leaderboard data (per language)
- **Features**:
  - `shouldRefresh()` - checks if cache is stale
  - `setDashboardData()` - updates dashboard cache
  - `setLeaderboardData()` - updates leaderboard cache per language
  - `invalidateDashboard()` - clears dashboard cache
  - `invalidateLeaderboard()` - clears leaderboard cache

### 2. Updated Dashboard (`app/dashboard/DashboardClient.tsx`)
- **Before**: Always loads skeleton, fetches data every time
- **After**: 
  - Shows cached data instantly if available
  - Displays skeleton only if no cache
  - Refreshes in background if cache is > 1 minute old
  - Page opens immediately with cached data

### 3. Updated Leaderboard (`app/leaderboard/page.tsx`)
- **Before**: Always loads skeleton, fetches data on language change
- **After**:
  - Shows cached data instantly for each language
  - Displays skeleton only if no cache for that language
  - Refreshes in background if cache is stale
  - Page opens immediately with cached data

### 4. Auto-Update on New Score (`components/ResultsModal.tsx`)
- When user completes a test and score is saved:
  - Invalidates dashboard cache
  - Invalidates leaderboard cache
- Next time user visits those pages, fresh data will be fetched

## How It Works

```
User clicks Dashboard/Leaderboard
        ↓
Check cache exists?
   ↓YES        ↓NO
Show cache   Show skeleton
   ↓              ↓
Check cache age  Fetch data
   ↓              ↓
>1min old?    Update cache
   ↓YES  ↓NO      ↓
Fetch  Done    Show data
   ↓
Update cache
   ↓
Done
```

## Benefits

1. **Instant Navigation**: Pages open immediately with cached data
2. **Background Refresh**: Stale data refreshes without blocking UI
3. **Smart Invalidation**: New scores automatically trigger fresh data
4. **Better UX**: Users see data instantly, skeleton only on first visit
5. **Reduced API Calls**: Data reused for 1 minute before refresh

## Cache Invalidation

Cache is cleared when:
1. User completes a test (both dashboard and leaderboard)
2. Cache is > 1 minute old (auto-refresh)
3. User changes language on leaderboard (per-language cache)

## Implementation Details

- **Storage**: In-memory Zustand store (resets on page refresh)
- **TTL**: 60 seconds (configurable in `dataCacheStore.ts`)
- **Granularity**: Per-language for leaderboard, global for dashboard
- **Persistence**: None (intentional - fresh data on app restart)
