import { NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

export async function GET() {
  try {
    await connectDB();

    const sponsors = await Sponsor.find({ active: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('name logoDataUri websiteUrl displayOrder')
      .lean();

    const response = NextResponse.json({
      success: true,
      data: sponsors,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Error fetching sponsors:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch sponsors',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
