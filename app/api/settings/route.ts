import { NextResponse } from 'next/server';
import { getAllAppSettings } from '@/lib/mongodb';

// GET /api/settings - Public endpoint to fetch app settings
export async function GET() {
  try {
    const settings = await getAllAppSettings();
    
    // Set caching headers for performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return NextResponse.json({ settings }, { headers });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
