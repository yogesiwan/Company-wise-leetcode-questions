import { NextResponse } from 'next/server';
import { getAllCompanies, getCompanyTimePeriods } from '@/lib/data-parser';

export async function GET() {
  try {
    const companies = getAllCompanies();
    const companiesWithPeriods = companies.map(company => ({
      name: company,
      availablePeriods: getCompanyTimePeriods(company),
    }));

    return NextResponse.json({ companies: companiesWithPeriods });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

