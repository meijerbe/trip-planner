import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabase } from '@/lib/db';

export async function POST() {
  const code = randomUUID().split('-')[0];
  const { data, error } = await supabase
    .from('boards')
    .insert({ code })
    .select('code')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data.code });
}
