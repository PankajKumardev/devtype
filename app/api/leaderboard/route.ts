import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Score } from '@/models/Score';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '50');

    await dbConnect();

    // Build query
    const query: any = {};
    if (language && language !== 'all') {
      query.language = language;
    }

    // Get best score per user
    // Group by userId, take the highest weighted score for each user
    const topScores = await Score.aggregate([
      { $match: query },
      {
        $addFields: {
          // Calculate weighted score: WPM * (accuracy/100)
          weightedScore: { $multiply: ['$wpm', { $divide: ['$accuracy', 100] }] }
        }
      },
      // Sort by weighted score descending within each user
      { $sort: { userId: 1, weightedScore: -1, timestamp: -1 } },
      // Group by userId and take the first (best) score
      {
        $group: {
          _id: '$userId',
          bestScore: { $first: '$$ROOT' }
        }
      },
      // Replace root with the best score document
      { $replaceRoot: { newRoot: '$bestScore' } },
      // Sort all users by their best weighted score
      { $sort: { weightedScore: -1, timestamp: -1 } },
      // Limit to top N users
      { $limit: limit },
      // Join with users collection
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    ]);

    // Format response
    const leaderboard = topScores.map((score: any, index: number) => ({
      rank: index + 1,
      name: score.user?.name || 'Anonymous',
      image: score.user?.image,
      wpm: score.wpm,
      accuracy: score.accuracy,
      weightedScore: Math.round(score.weightedScore),
      language: score.language,
      duration: score.duration,
      timestamp: score.timestamp,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
