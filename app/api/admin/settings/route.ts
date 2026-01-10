import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { isAdmin, getAllAppSettings, setAppSetting } from '@/lib/mongodb';

// GET /api/admin/settings - Admin-only, fetch all settings
export async function GET() {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminStatus = await isAdmin(session.user.email);
  if (!adminStatus) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const settings = await getAllAppSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Admin-only, update a setting
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminStatus = await isAdmin(session.user.email);
  if (!adminStatus) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      );
    }

    if (value === undefined || typeof value !== 'string') {
      return NextResponse.json(
        { error: 'Setting value is required' },
        { status: 400 }
      );
    }

    const success = await setAppSetting(key, value, session.user.email);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      key,
      value,
    });
  } catch (error) {
    console.error('Error updating admin setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}
