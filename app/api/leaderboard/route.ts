import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Score } from '@/models/Score';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language');
    const duration = searchParams.get('duration');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Standard leaderboard times only
    const standardTimes = [15, 30, 60, 120];

    await dbConnect();

    // Build query - only include standard times
    const query: any = {
      duration: { $in: standardTimes }
    };
    
    // Filter by specific duration if provided
    if (duration && duration !== 'all') {
      const durationNum = parseInt(duration);
      if (standardTimes.includes(durationNum)) {
        query.duration = durationNum;
      }
    }
    
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
      // Skip for pagination
      { $skip: offset },
      // Limit to N+1 to check if there are more
      { $limit: limit + 1 },
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

    // Check if there are more results
    const hasMore = topScores.length > limit;
    const results = hasMore ? topScores.slice(0, limit) : topScores;

    // Format response
    const leaderboard = results.map((score: any, index: number) => ({
      rank: offset + index + 1,
      name: score.user?.name || 'Anonymous',
      image: score.user?.image,
      wpm: score.wpm,
      accuracy: score.accuracy,
      weightedScore: Math.round(score.weightedScore),
      language: score.language,
      duration: score.duration,
      timestamp: score.timestamp,
    }));

    return NextResponse.json({ leaderboard, hasMore });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
