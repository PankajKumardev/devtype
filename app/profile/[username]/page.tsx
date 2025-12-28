'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeatmapCalendar from '@/components/HeatmapCalendar';

interface ProfileData {
  profile: {
    name: string;
    image?: string;
    joinedAt: string;
  };
  stats: {
    totalTests: number;
    bestWpm: number;
    avgWpm: number;
    avgAccuracy: number;
    bestPerLanguage: Record<string, number>;
  };
  activityData: { date: string; count: number }[];
  recentScores: {
    wpm: number;
    accuracy: number;
    language: string;
    duration: number;
    date: string;
  }[];
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${username}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load profile');
          }
          return;
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen font-mono bg-bg flex items-center justify-center">
        <p className="text-sub">loading...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen font-mono bg-bg">
        <header className="w-full py-4 md:py-6 px-4 md:px-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-medium text-main no-underline hover:opacity-80 transition-opacity">
              devtype
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 md:px-10 py-8">
          <div className="text-center py-20">
            <p className="text-4xl mb-4">😕</p>
            <p className="text-xl text-text mb-2">{error || 'User not found'}</p>
            <Link href="/" className="text-main hover:underline">
              Back to home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { profile: userProfile, stats, activityData, recentScores } = profile;

  return (
    <div className="min-h-screen font-mono bg-bg">
      {/* Header */}
      <header className="w-full py-4 md:py-6 px-4 md:px-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-medium text-main no-underline hover:opacity-80 transition-opacity">
            devtype
          </Link>
          <Link href="/leaderboard" className="text-xs md:text-sm text-sub no-underline hover:text-text transition-colors">
            leaderboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-10 py-4 md:py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4 md:gap-6 mb-8">
          {userProfile.image ? (
            <Image
              src={userProfile.image}
              alt={userProfile.name}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-bg-sub flex items-center justify-center text-2xl text-main">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-4xl font-normal text-main mb-1">{userProfile.name}</h1>
            <p className="text-sm text-sub">
              joined {new Date(userProfile.joinedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="bg-bg-sub rounded-xl p-4 border border-border">
            <p className="text-xs text-sub mb-1">tests</p>
            <p className="text-2xl text-main">{stats.totalTests}</p>
          </div>
          <div className="bg-bg-sub rounded-xl p-4 border border-border">
            <p className="text-xs text-sub mb-1">best wpm</p>
            <p className="text-2xl text-main">{stats.bestWpm}</p>
          </div>
          <div className="bg-bg-sub rounded-xl p-4 border border-border">
            <p className="text-xs text-sub mb-1">avg wpm</p>
            <p className="text-2xl text-main">{stats.avgWpm}</p>
          </div>
          <div className="bg-bg-sub rounded-xl p-4 border border-border">
            <p className="text-xs text-sub mb-1">accuracy</p>
            <p className="text-2xl text-main">{stats.avgAccuracy}%</p>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="mb-8">
          <HeatmapCalendar activityData={activityData} />
        </div>

        {/* Best Per Language */}
        {Object.keys(stats.bestPerLanguage).length > 0 && (
          <div className="bg-bg-sub rounded-xl p-4 md:p-6 border border-border mb-8">
            <h3 className="text-sm md:text-base text-text mb-4">best wpm by language</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.bestPerLanguage).map(([lang, wpm]) => (
                <div key={lang} className="px-4 py-2 bg-bg rounded-lg">
                  <span className="text-sub text-sm">{lang}: </span>
                  <span className="text-main text-sm font-medium">{wpm} wpm</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentScores.length > 0 && (
          <div className="bg-bg-sub rounded-xl p-4 md:p-6 border border-border">
            <h3 className="text-sm md:text-base text-text mb-4">recent activity</h3>
            <div className="space-y-2">
              {recentScores.map((score, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-main font-medium">{score.wpm} wpm</span>
                    <span className="text-sub text-sm">{score.accuracy}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-sub">
                    <span>{score.language}</span>
                    <span>{score.duration}s</span>
                    <span>{new Date(score.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Link */}
        <div className="mt-8 text-center">
          <p className="text-xs text-sub mb-2">share this profile</p>
          <code className="text-sm text-main bg-bg-sub px-4 py-2 rounded-lg">
            devtype.pankajk.tech/profile/{username}
          </code>
        </div>
      </main>
    </div>
  );
}
