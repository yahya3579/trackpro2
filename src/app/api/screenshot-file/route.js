// trackpro2/src/app/api/screenshot-file/route.js
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  if (!name) {
    return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
  }

  const filePath = path.join('C:\\Users\\Yahya\\Desktop\\Tracking\\Tracker\\src\\screenshot', name);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  // You may want to set the correct content-type based on file extension
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png', // or detect from file extension
      'Content-Disposition': `inline; filename="${name}"`,
    },
  });
}