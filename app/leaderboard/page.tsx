'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { languages } from '@/lib/snippets';
import { LeaderboardSkeleton } from '@/components/Skeletons';
import { useDataCache } from '@/store/dataCacheStore';

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

export default function LeaderboardPage() {
  const { leaderboard: cachedLeaderboard, setLeaderboardData, shouldRefresh } = useDataCache();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const cached = cachedLeaderboard[selectedLanguage];
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(cached?.entries || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    // If we have cached data for this language, use it immediately
    const cachedData = cachedLeaderboard[selectedLanguage];
    if (cachedData) {
      setLeaderboard(cachedData.entries);
      setLoading(false);
      
      // Check if we should refresh
      if (shouldRefresh(cachedData.lastFetched)) {
        fetchLeaderboard();
      }
    } else {
      // No cache for this language, fetch immediately
      fetchLeaderboard();
    }
  }, [selectedLanguage]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `/api/leaderboard?language=${selectedLanguage}&limit=50`
      );
      const data = await response.json();
      const entries = data.leaderboard || [];
      
      setLeaderboard(entries);
      setLeaderboardData(selectedLanguage, entries);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-mono bg-bg">
      {/* Header */}
      <header className="w-full py-4 md:py-6 px-4 md:px-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-medium text-main no-underline hover:opacity-80 transition-opacity">
            devtype
          </Link>
          <Link href="/" className="text-xs md:text-sm text-sub no-underline hover:text-text transition-colors">
            back to practice
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-10 py-4 md:py-8">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-normal text-main mb-6 md:mb-10">leaderboard</h1>

        {/* Language Filters */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-6 md:mb-10">
          <span className="text-xs md:text-sm text-sub mr-1 md:mr-2">language:</span>
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 md:px-5 py-1.5 md:py-2.5 text-xs md:text-sm rounded-lg border-none cursor-pointer font-mono transition-colors
              ${selectedLanguage === 'all' ? 'bg-bg-sub text-main' : 'bg-transparent text-sub hover:text-text hover:bg-bg-sub/50'}`}
          >
            all
          </button>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 md:px-5 py-1.5 md:py-2.5 text-xs md:text-sm rounded-lg border-none cursor-pointer font-mono transition-colors
                ${selectedLanguage === lang ? 'bg-bg-sub text-main' : 'bg-transparent text-sub hover:text-text hover:bg-bg-sub/50'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LeaderboardSkeleton />
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-bg-sub rounded-xl border border-border">
            <p className="text-sub text-base md:text-lg mb-4">no scores yet</p>
            <Link href="/" className="text-main no-underline hover:opacity-80 transition-opacity">
              be the first to submit a score →
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={index}
                  className="bg-bg-sub rounded-xl p-4 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-medium ${entry.rank <= 3 ? 'text-main' : 'text-sub'}`}>
                        #{entry.rank}
                      </span>
                      {entry.image ? (
                        <Image
                          src={entry.image}
                          alt={entry.name}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-sub/50" />
                      )}
                      <span className="text-text text-sm">{entry.name}</span>
                    </div>
                    <span className="text-main font-medium text-lg">{entry.wpm}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-sub">
                    <span>{entry.accuracy}% acc</span>
                    <span>{entry.language}</span>
                    <span>{entry.duration}s</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-bg-sub rounded-xl border border-border overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-sub text-sm text-left border-b border-border">
                    <th className="py-5 px-6 font-normal">#</th>
                    <th className="py-5 px-6 font-normal">name</th>
                    <th className="py-5 px-6 font-normal">wpm</th>
                    <th className="py-5 px-6 font-normal">accuracy</th>
                    <th className="py-5 px-6 font-normal">language</th>
                    <th className="py-5 px-6 font-normal">time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={index}
                      className="border-b border-border last:border-b-0 hover:bg-border/30 transition-colors"
                    >
                      <td className="py-5 px-6">
                        <span className={entry.rank <= 3 ? 'text-main font-medium' : 'text-sub'}>
                          {entry.rank}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          {entry.image ? (
                            <Image
                              src={entry.image}
                              alt={entry.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-sub/50" />
                          )}
                          <span className="text-text">{entry.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-main font-medium">{entry.wpm}</span>
                      </td>
                      <td className="py-5 px-6 text-text">{entry.accuracy}%</td>
                      <td className="py-5 px-6 text-sub">{entry.language}</td>
                      <td className="py-5 px-6 text-sub">{entry.duration}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
