import { NextResponse } from 'next/server';
import { getAllCompanies, getCompanyTimePeriods } from '@/lib/data-parser';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const companies = getAllCompanies();
    
    // Set caching headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    // Only log in development or if there's an issue
    if (companies.length === 0) {
      const dataDir = path.join(process.cwd(), 'data');
      const dataDirExists = fs.existsSync(dataDir);
      
      // Enhanced debugging for Vercel
      const debugInfo: any = {
        dataDir,
        dataDirExists,
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? 'true' : 'false',
      };
      
      // Try to list directory contents for debugging
      try {
        const cwdFiles = fs.readdirSync(process.cwd());
        debugInfo.cwdFiles = cwdFiles.slice(0, 10);
      } catch (e) {
        debugInfo.cwdReadError = e instanceof Error ? e.message : String(e);
      }
      
      // Check if data directory exists in alternative locations
      const altPaths = [
        path.join(process.cwd(), '..', 'data'),
        path.resolve(process.cwd(), 'data'),
      ];
      
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          debugInfo.foundAltPath = altPath;
          break;
        }
      }
      
      console.error('No companies found. Debug info:', JSON.stringify(debugInfo, null, 2));
      
      return NextResponse.json(
        { 
          error: 'No companies found. Please ensure the data folder is included in your deployment.',
          debug: process.env.NODE_ENV === 'development' ? debugInfo : undefined,
        },
        { status: 404 }
      );
    }

    const companiesWithPeriods = companies.map(company => ({
      name: company,
      availablePeriods: getCompanyTimePeriods(company),
    }));

    return NextResponse.json({ companies: companiesWithPeriods }, { headers });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch companies',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

