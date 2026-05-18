import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { TripMap, ElevationProfile } from '@/components/map/TripMap';
import BoardHeader from '@/components/map/BoardHeader';

export default async function BoardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data: board } = await supabase
    .from('boards').select('id').eq('code', code).single();
  if (!board) notFound();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <BoardHeader boardCode={code} />
      <TripMap boardCode={code} />
      <ElevationProfile />
    </main>
  );
}
