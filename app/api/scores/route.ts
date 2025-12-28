import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { Score } from '@/models/Score';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wpm, accuracy, language, duration } = await req.json();

    if (!wpm || accuracy === undefined || !language || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Anti-spam: Reject unrealistic WPM (more than 300 is suspicious)
    if (wpm > 300) {
      return NextResponse.json({ 
        error: 'Score not saved. WPM seems unrealistic.',
        reason: 'unrealistic_wpm'
      }, { status: 400 });
    }

    await dbConnect();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save score (allow any accuracy - WPM is already calculated from correct chars only)
    const score = await Score.create({
      userId: user._id,
      wpm,
      accuracy,
      language,
      duration,
      timestamp: new Date(),
    });

    // Update user stats
    const totalTests = user.stats.testsCompleted + 1;
    const newAvgAccuracy = 
      (user.stats.avgAccuracy * user.stats.testsCompleted + accuracy) / totalTests;
    
    user.stats.testsCompleted = totalTests;
    user.stats.bestWpm = Math.max(user.stats.bestWpm, wpm);
    user.stats.avgAccuracy = Math.round(newAvgAccuracy);
    
    await user.save();

    return NextResponse.json({ 
      success: true, 
      score,
      stats: user.stats 
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const scores = await Score.find({ userId: user._id })
      .sort({ timestamp: -1 });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
