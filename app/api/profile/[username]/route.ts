import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { Score } from '@/models/Score';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    const mongooseInstance = await dbConnect();

    // Use raw collection to bypass Mongoose schema caching issues (since we added username field recently)
    const collection = mongooseInstance.connection.collection('users');
    
    // Find user by unique username OR by name (fallback)
    let user = await collection.findOne({ username: username.toLowerCase() });
    
    // Fallback: try to find by name
    if (!user) {
      const decodedName = decodeURIComponent(username);
      user = await collection.findOne({ 
        name: { $regex: new RegExp(`^${decodedName}$`, 'i') }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's scores
    const scores = await Score.find({ userId: user._id })
      .sort({ timestamp: -1 });

    // Calculate stats
    const totalTests = scores.length;
    const bestWpm = scores.length > 0 ? Math.max(...scores.map(s => s.wpm)) : 0;
    const avgWpm = scores.length > 0 
      ? Math.round(scores.reduce((acc, s) => acc + s.wpm, 0) / scores.length)
      : 0;
    const avgAccuracy = scores.length > 0
      ? Math.round(scores.reduce((acc, s) => acc + s.accuracy, 0) / scores.length)
      : 0;

    // Get best per language
    const bestPerLanguage: Record<string, number> = {};
    scores.forEach(score => {
      if (!bestPerLanguage[score.language] || score.wpm > bestPerLanguage[score.language]) {
        bestPerLanguage[score.language] = score.wpm;
      }
    });

    // Get activity data for heatmap (last 365 days)
    const activityData = scores.reduce((acc, score) => {
      const date = new Date(score.timestamp).toISOString().split('T')[0];
      const existing = acc.find((d: { date: string; count: number }) => d.date === date);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, [] as { date: string; count: number }[]);

    // Recent scores (last 10)
    const recentScores = scores.slice(0, 10).map(s => ({
      wpm: s.wpm,
      accuracy: s.accuracy,
      language: s.language,
      duration: s.duration,
      date: s.timestamp,
    }));

    return NextResponse.json({
      profile: {
        name: user.name,
        username: user.username,
        image: user.image,
        joinedAt: user.createdAt,
      },
      stats: {
        totalTests,
        bestWpm,
        avgWpm,
        avgAccuracy,
        bestPerLanguage,
      },
      activityData,
      recentScores,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
