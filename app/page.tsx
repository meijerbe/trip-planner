import { TripMap, ElevationProfile } from '@/components/map/TripMap';
import CreateBoardButton from '@/components/map/CreateBoardButton';

const STATS = [
  { value: '7',        label: 'Days' },
  { value: '6',        label: 'Stops' },
  { value: '~750 km',  label: 'Distance' },
  { value: '3 Hilux',  label: 'Vehicles' },
  { value: '2 926 m',  label: 'Highest pass' },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">

      <div>
        <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-1">
          Georgia · 3 Hilux 4x4
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Caucasus 7-Day Circuit
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Military Highway · Tusheti · Kakheti · fly in and out of Tbilisi
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="rounded-xl bg-white border border-slate-200 px-4 py-4 text-center shadow-sm">
            <div className="text-xl font-bold text-orange-500">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <CreateBoardButton />

      <TripMap />

      <ElevationProfile />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-slate-900 text-slate-300 px-5 py-5 leading-relaxed">
          <p className="font-semibold text-white mb-2">Why Hilux 4x4?</p>
          <p>The Abano Pass into Tusheti (2 926 m) is one of the most dramatic — and legally
          4x4-only — roads in Europe. Loose shale, sheer drops, no barriers. Ordinary vehicles
          are turned back at the entrance. Three trucks mean a self-sufficient convoy with
          recovery gear, spare fuel, and no dependency on rescue.</p>
        </div>
        <div className="rounded-xl bg-orange-50 border border-orange-100 px-5 py-5 leading-relaxed text-orange-900">
          <p className="font-semibold mb-2">Day-by-day</p>
          <ol className="space-y-1 list-decimal list-inside text-orange-800">
            <li>Tbilisi — fly in, old town and baths</li>
            <li>Mtskheta then north to Kazbegi</li>
            <li>Kazbegi — Gergeti Church hike (2 170 m)</li>
            <li>Tusheti via Abano Pass (2 926 m)</li>
            <li>Sighnaghi wine and David Gareja</li>
            <li>Back to Tbilisi — final supra feast</li>
            <li>Fly home</li>
          </ol>
        </div>
      </div>

    </main>
  );
}
