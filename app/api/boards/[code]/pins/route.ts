import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

type RouteCtx = { params: Promise<{ code: string }> };

export async function GET(_req: Request, { params }: RouteCtx) {
  const { code } = await params;
  const { data: board } = await supabase
    .from('boards').select('id').eq('code', code).single();
  if (!board) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: pins, error } = await supabase
    .from('pins').select('*').eq('board_id', board.id).order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(pins);
}

export async function POST(req: Request, { params }: RouteCtx) {
  const { code } = await params;
  const { data: board } = await supabase
    .from('boards').select('id').eq('code', code).single();
  if (!board) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { lng, lat, label, author, color } = await req.json();
  const { data: pin, error } = await supabase
    .from('pins')
    .insert({ board_id: board.id, lng, lat, label: label ?? '', author: author ?? 'anon', color: color ?? '#6366f1' })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(pin);
}
