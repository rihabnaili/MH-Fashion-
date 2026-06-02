import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

const MAX_LOGO_BYTES = 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

async function fileToDataUri(file: File) {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new Error('Logo must be a JPG, PNG, WEBP, or SVG image');
  }

  if (file.size > MAX_LOGO_BYTES) {
    throw new Error('Logo must be smaller than 1MB');
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString('base64')}`;
}

function normalizeWebsiteUrl(value: FormDataEntryValue | null) {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export async function GET() {
  try {
    await connectDB();

    const sponsors = await Sponsor.find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: sponsors,
    });
  } catch (error) {
    console.error('Error fetching admin sponsors:', error);

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = String(formData.get('name') || '').trim();
    const logo = formData.get('logo');
    const displayOrder = Number(formData.get('displayOrder') || 0);

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Sponsor name is required' },
        { status: 400 }
      );
    }

    if (!(logo instanceof File) || logo.size === 0) {
      return NextResponse.json(
        { success: false, message: 'Sponsor logo is required' },
        { status: 400 }
      );
    }

    const sponsor = await Sponsor.create({
      name,
      logoDataUri: await fileToDataUri(logo),
      websiteUrl: normalizeWebsiteUrl(formData.get('websiteUrl')),
      active: formData.get('active') !== 'false',
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Sponsor created successfully',
        data: sponsor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sponsor:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create sponsor',
      },
      { status: 500 }
    );
  }
}
