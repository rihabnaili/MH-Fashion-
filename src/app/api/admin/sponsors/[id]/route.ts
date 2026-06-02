import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

function normalizeWebsiteUrl(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string') {
      updates.name = body.name.trim();
    }

    if (typeof body.websiteUrl === 'string') {
      updates.websiteUrl = normalizeWebsiteUrl(body.websiteUrl);
    }

    if (typeof body.active === 'boolean') {
      updates.active = body.active;
    }

    if (typeof body.displayOrder === 'number' && Number.isFinite(body.displayOrder)) {
      updates.displayOrder = body.displayOrder;
    }

    const sponsor = await Sponsor.findByIdAndUpdate(params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!sponsor) {
      return NextResponse.json(
        { success: false, message: 'Sponsor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sponsor updated successfully',
      data: sponsor,
    });
  } catch (error) {
    console.error('Error updating sponsor:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update sponsor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const sponsor = await Sponsor.findByIdAndDelete(params.id);

    if (!sponsor) {
      return NextResponse.json(
        { success: false, message: 'Sponsor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sponsor deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sponsor:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete sponsor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
