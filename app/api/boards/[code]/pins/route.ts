import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import db from '@/lib/db';

type RouteCtx = { params: Promise<{ code: string }> };

export async function GET(_req: Request, { params }: RouteCtx) {
  const { code } = await params;
  const board = db.prepare('SELECT id FROM boards WHERE code = ?').get(code) as { id: string } | undefined;
  if (!board) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const pins = db.prepare('SELECT * FROM pins WHERE board_id = ? ORDER BY created_at').all(board.id);
  return NextResponse.json(pins);
}

export async function POST(req: Request, { params }: RouteCtx) {
  const { code } = await params;
  const board = db.prepare('SELECT id FROM boards WHERE code = ?').get(code) as { id: string } | undefined;
  if (!board) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const { lng, lat, label, author, color } = await req.json();
  const id = randomUUID();
  db.prepare('INSERT INTO pins (id, board_id, lng, lat, label, author, color) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, board.id, lng, lat, label ?? '', author ?? 'anon', color ?? '#6366f1');
  const pin = db.prepare('SELECT * FROM pins WHERE id = ?').get(id);
  return NextResponse.json(pin);
}
