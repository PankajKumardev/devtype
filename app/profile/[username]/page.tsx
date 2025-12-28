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

const THEMES = [
  { id: 'dark', name: 'Dark', bg: '#323437' },
  { id: 'ocean', name: 'Ocean', bg: '#1a2634' },
  { id: 'forest', name: 'Forest', bg: '#1e2d24' },
  { id: 'sunset', name: 'Sunset', bg: '#2d1f2f' },
  { id: 'light', name: 'Light', bg: '#f5f5f5' },
];

function EmbedSection({ username }: { username: string }) {
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const embedUrl = `https://devtype.pankajk.tech/api/embed/${username}${selectedTheme !== 'dark' ? `?theme=${selectedTheme}` : ''}`;
  const profileUrl = `https://devtype.pankajk.tech/profile/${username}`;
  const markdownCode = `[![DevType Activity](${embedUrl})](${profileUrl})`;

  return (
    <div className="mt-8 bg-bg-sub rounded-xl p-4 md:p-6 border border-border">
      <h3 className="text-sm md:text-base text-text mb-4">share & embed</h3>
      
      <div className="space-y-4">
        {/* Profile URL */}
        <div>
          <p className="text-xs text-sub mb-2">profile url</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-main bg-bg px-3 py-2 rounded-lg overflow-x-auto">
              {profileUrl}
            </code>
            <button
              onClick={() => copyToClipboard(profileUrl, 'url')}
              className="px-3 py-2 bg-bg rounded-lg text-xs text-sub hover:text-text transition-colors border-none cursor-pointer"
            >
              {copied === 'url' ? '✓' : 'copy'}
            </button>
          </div>
        </div>
        
        {/* Theme Selector */}
        <div>
          <p className="text-xs text-sub mb-2">select theme for embed</p>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer transition-all flex items-center gap-2
                  ${selectedTheme === theme.id 
                    ? 'bg-main text-bg font-medium' 
                    : 'bg-bg text-sub hover:text-text'}`}
                style={selectedTheme !== theme.id ? {} : { color: '#1a1a1a' }}
              >
                <span 
                  className="w-3 h-3 rounded-sm border border-border" 
                  style={{ backgroundColor: theme.bg }}
                />
                {theme.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Markdown Embed Code */}
        <div>
          <p className="text-xs text-sub mb-2">embed in github readme (markdown)</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-main bg-bg px-3 py-2 rounded-lg overflow-x-auto whitespace-nowrap">
              {markdownCode}
            </code>
            <button
              onClick={() => copyToClipboard(markdownCode, 'markdown')}
              className="px-3 py-2 bg-bg rounded-lg text-xs text-sub hover:text-text transition-colors border-none cursor-pointer"
            >
              {copied === 'markdown' ? '✓' : 'copy'}
            </button>
          </div>
        </div>
        
        {/* Preview */}
        <div>
          <p className="text-xs text-sub mb-2">preview</p>
          <div 
            className="rounded-lg p-3 overflow-x-auto"
            style={{ backgroundColor: THEMES.find(t => t.id === selectedTheme)?.bg }}
          >
            <img 
              src={`/api/embed/${username}?theme=${selectedTheme}`} 
              alt={`DevType Activity (${selectedTheme})`}
              className="max-w-full h-auto"
              key={selectedTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
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
        <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-8">
          {userProfile.image ? (
            <Image
              src={userProfile.image}
              alt={userProfile.name}
              width={64}
              height={64}
              className="rounded-full w-14 h-14 md:w-20 md:h-20"
            />
          ) : (
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-bg-sub flex items-center justify-center text-xl md:text-2xl text-main shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl md:text-4xl font-normal text-main mb-1 truncate">{userProfile.name}</h1>
            <p className="text-xs md:text-sm text-sub">
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

        {/* Share & Embed */}
        <EmbedSection username={username} />
      </main>
    </div>
  );
}
