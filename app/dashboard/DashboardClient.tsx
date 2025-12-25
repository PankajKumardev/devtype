'use client';

import { useEffect, useState } from 'react';
import { Session } from 'next-auth';
import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import KeyboardHeatmap from '@/components/KeyboardHeatmap';

interface Score {
  _id: string;
  wpm: number;
  accuracy: number;
  language: string;
  duration: number;
  timestamp: string;
}

interface DashboardClientProps {
  session: Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregateKeyErrors, setAggregateKeyErrors] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/scores');
      const data = await response.json();
      setScores(data.scores || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = session.user?.stats || {
    testsCompleted: 0,
    bestWpm: 0,
    avgAccuracy: 0,
  };

  // Calculate additional stats
  const recentScores = scores.slice(0, 10);
  const avgWpm = scores.length > 0 
    ? Math.round(scores.reduce((acc, s) => acc + s.wpm, 0) / scores.length)
    : 0;
  
  // Language breakdown
  const languageStats = scores.reduce((acc, s) => {
    acc[s.language] = (acc[s.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Best WPM per language
  const bestPerLanguage = scores.reduce((acc, s) => {
    if (!acc[s.language] || s.wpm > acc[s.language]) {
      acc[s.language] = s.wpm;
    }
    return acc;
  }, {} as Record<string, number>);

  // Chart data - last 10 tests reversed for chronological order
  const chartData = [...recentScores].reverse().map((s, i) => ({
    test: i + 1,
    wpm: s.wpm,
    accuracy: s.accuracy,
    date: new Date(s.timestamp).toLocaleDateString(),
  }));

  return (
    <div className="min-h-screen font-mono bg-bg">
      {/* Header */}
      <header className="w-full py-6 px-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-medium text-main no-underline hover:opacity-80 transition-opacity">
            devtype
          </Link>
          <Link href="/" className="text-sm text-sub no-underline hover:text-text transition-colors">
            back to practice
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-10 py-8">
        {/* Profile */}
        <div className="flex items-center gap-4 mb-10">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user?.name || 'User'}
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-normal text-main">{session.user?.name}</h1>
            <p className="text-sub">{session.user?.email}</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-bg-sub rounded-xl p-6 border border-border">
            <p className="text-sm text-sub mb-2">tests completed</p>
            <p className="text-4xl text-main font-normal">{stats.testsCompleted}</p>
          </div>
          <div className="bg-bg-sub rounded-xl p-6 border border-border">
            <p className="text-sm text-sub mb-2">best wpm</p>
            <p className="text-4xl text-main font-normal">{stats.bestWpm}</p>
          </div>
          <div className="bg-bg-sub rounded-xl p-6 border border-border">
            <p className="text-sm text-sub mb-2">average wpm</p>
            <p className="text-4xl text-main font-normal">{avgWpm}</p>
          </div>
          <div className="bg-bg-sub rounded-xl p-6 border border-border">
            <p className="text-sm text-sub mb-2">avg accuracy</p>
            <p className="text-4xl text-main font-normal">{stats.avgAccuracy}%</p>
          </div>
        </div>

        {/* Charts Row */}
        {scores.length >= 2 && (
          <div className="grid grid-cols-2 gap-6 mb-10">
            {/* WPM Chart */}
            <div className="bg-bg-sub rounded-xl p-6 border border-border">
              <h3 className="text-lg text-text mb-4">wpm over time</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e2b714" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e2b714" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="test" stroke="#646669" fontSize={12} />
                    <YAxis stroke="#646669" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#2c2e31', 
                        border: '1px solid #3d3d3d',
                        borderRadius: '8px',
                        color: '#d1d0c5',
                      }}
                    />
                    <Area type="monotone" dataKey="wpm" stroke="#e2b714" fill="url(#wpmGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accuracy Chart */}
            <div className="bg-bg-sub rounded-xl p-6 border border-border">
              <h3 className="text-lg text-text mb-4">accuracy over time</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="test" stroke="#646669" fontSize={12} />
                    <YAxis stroke="#646669" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#2c2e31', 
                        border: '1px solid #3d3d3d',
                        borderRadius: '8px',
                        color: '#d1d0c5',
                      }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#4ade80" strokeWidth={2} dot={{ fill: '#4ade80' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Best Per Language */}
        {Object.keys(bestPerLanguage).length > 0 && (
          <div className="bg-bg-sub rounded-xl p-6 border border-border mb-10">
            <h3 className="text-lg text-text mb-4">best wpm per language</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(bestPerLanguage).map(([lang, wpm]) => (
                <div key={lang} className="flex items-center gap-3 bg-bg rounded-lg px-4 py-3">
                  <span className="text-sub">{lang}</span>
                  <span className="text-main font-medium">{wpm}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tests */}
        <h2 className="text-2xl font-normal text-text mb-6">recent tests</h2>

        {loading ? (
          <p className="text-sub">loading...</p>
        ) : scores.length === 0 ? (
          <div className="text-center py-12 bg-bg-sub rounded-xl border border-border">
            <p className="text-sub mb-4">no tests yet</p>
            <Link href="/" className="text-main no-underline hover:opacity-80 transition-opacity">
              start typing →
            </Link>
          </div>
        ) : (
          <div className="bg-bg-sub rounded-xl border border-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-sub text-sm text-left border-b border-border">
                  <th className="py-5 px-6 font-normal">date</th>
                  <th className="py-5 px-6 font-normal">wpm</th>
                  <th className="py-5 px-6 font-normal">accuracy</th>
                  <th className="py-5 px-6 font-normal">language</th>
                  <th className="py-5 px-6 font-normal">duration</th>
                </tr>
              </thead>
              <tbody>
                {scores.slice(0, 10).map((score) => (
                  <tr 
                    key={score._id}
                    className="border-b border-border last:border-b-0 hover:bg-border/30 transition-colors"
                  >
                    <td className="py-5 px-6 text-sub">
                      {new Date(score.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-main font-medium">{score.wpm}</span>
                    </td>
                    <td className="py-5 px-6 text-text">{score.accuracy}%</td>
                    <td className="py-5 px-6 text-sub">{score.language}</td>
                    <td className="py-5 px-6 text-sub">{score.duration}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
