import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import db from '@/lib/db';

export async function POST() {
  const id = randomUUID();
  const code = id.split('-')[0]; // 8 lowercase hex chars e.g. "a3b2c1d0"
  db.prepare('INSERT INTO boards (id, code) VALUES (?, ?)').run(id, code);
  return NextResponse.json({ code });
}
