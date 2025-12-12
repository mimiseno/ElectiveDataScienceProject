import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get user statistics
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, status, role, created_at');

    if (usersError) {
      throw usersError;
    }

    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter(u => u.status === 'active').length || 0;
    const inactiveUsers = users?.filter(u => u.status === 'inactive').length || 0;
    const adminUsers = users?.filter(u => u.role === 'admin').length || 0;
    const regularUsers = users?.filter(u => u.role === 'user').length || 0;

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = users?.filter(u => 
      new Date(u.created_at) >= startOfMonth
    ).length || 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentActivity, error: activityError } = await supabase
      .from('activity_logs')
      .select('activity_type, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (activityError) {
      console.error('Activity error:', activityError);
    }

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        regularUsers,
        newUsersThisMonth,
        activityCount: recentActivity?.length || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
