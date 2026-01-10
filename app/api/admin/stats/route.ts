import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { getDb, User, isAdmin } from '@/lib/mongodb';

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
  const session = await getServerSession(authConfig);
  
  // Check authentication
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin status
  const adminStatus = await isAdmin(session.user.email);
  if (!adminStatus) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection<User>('users');
    const userStatesCollection = db.collection('userQuestionStates');

    // Get current date boundaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(todayStart);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Aggregate stats in parallel
    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeToday,
      activeThisWeek,
      totalQuestionsCompleted,
      totalNotesCreated,
    ] = await Promise.all([
      // Total users
      usersCollection.countDocuments(),
      
      // New users today
      usersCollection.countDocuments({ createdAt: { $gte: todayStart } }),
      
      // New users this week
      usersCollection.countDocuments({ createdAt: { $gte: weekAgo } }),
      
      // New users this month
      usersCollection.countDocuments({ createdAt: { $gte: monthAgo } }),
      
      // Active today (logged in today)
      usersCollection.countDocuments({ lastLoginAt: { $gte: todayStart } }),
      
      // Active this week
      usersCollection.countDocuments({ lastLoginAt: { $gte: weekAgo } }),
      
      // Total questions marked as done
      userStatesCollection.countDocuments({ done: true }),
      
      // Total notes created (non-empty notes)
      userStatesCollection.countDocuments({ note: { $exists: true, $ne: '' } }),
    ]);

    // Get top users by login count
    const topUsers = await usersCollection
      .find({})
      .sort({ loginCount: -1 })
      .limit(5)
      .toArray();

    // Get recent sign-ups
    const recentSignups = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      stats: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        activeToday,
        activeThisWeek,
        totalQuestionsCompleted,
        totalNotesCreated,
      },
      topUsers: topUsers.map(u => ({
        email: u.email,
        name: u.name,
        loginCount: u.loginCount,
        lastLoginAt: u.lastLoginAt,
      })),
      recentSignups: recentSignups.map(u => ({
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        provider: u.provider,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
