import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'grss_super_secret_change_in_production'
);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function parseCookies(req: NextRequest): Record<string, string> {
  const cookieHeader = req.headers.get('cookie') || '';
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth: admin only ──
  try {
    const cookies = parseCookies(req);
    const token = cookies['auth_token'];
    if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // ── Parse multipart ──
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // ── Validate ──
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP and GIF images are allowed' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
  }

  // ── Upload to Vercel Blob ──
  try {
    const filename = `grss-questions/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('Blob upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
