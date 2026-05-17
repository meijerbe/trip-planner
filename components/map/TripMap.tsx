'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoJSONSource, Marker, Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

const STYLE_URLS = {
  terrain:   `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`,
  satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`,
} as const;

const STOPS = [
  { day: 1, endDay: 1, name: 'Tbilisi',         country: 'Georgia', coords: [44.833, 41.694] as [number, number], highlight: 'Fly in — sulfur baths, Narikala fortress, Old Town lanes & Georgian wine' },
  { day: 2, endDay: 2, name: 'Mtskheta',        country: 'Georgia', coords: [44.718, 41.843] as [number, number], highlight: 'UNESCO ancient capital — Jvari Monastery (586 AD) above the river confluence' },
  { day: 2, endDay: 3, name: 'Kazbegi',         country: 'Georgia', coords: [44.654, 42.657] as [number, number], highlight: 'Georgian Military Highway — Gergeti Trinity Church at 2 170 m, Dariali Gorge' },
  { day: 4, endDay: 4, name: 'Tusheti (Omalo)', country: 'Georgia', coords: [45.408, 42.393] as [number, number], highlight: '4x4 ONLY — Abano Pass (2 926 m), medieval watchtowers, wolves & glaciers' },
  { day: 5, endDay: 5, name: 'Sighnaghi',       country: 'Georgia', coords: [45.920, 41.614] as [number, number], highlight: 'Walled "City of Love" — Alazani Valley panorama, Kakheti wine & feast' },
  { day: 5, endDay: 6, name: 'David Gareja',    country: 'Georgia', coords: [45.370, 41.590] as [number, number], highlight: '6th-century desert monastery — ancient frescoes carved into alien rock' },
  { day: 6, endDay: 6, name: 'Tbilisi',         country: 'Georgia', coords: [44.848, 41.700] as [number, number], highlight: 'Return — final supra feast, fly home on Day 7' },
];

// Transit waypoint through the Alazani valley gives the line a realistic path
const ROUTE_COORDS: [number, number][] = [
  [44.833, 41.694],
  [44.718, 41.843],
  [44.654, 42.657],
  [45.408, 42.393],
  [45.800, 41.900],
  [45.920, 41.614],
  [45.370, 41.590],
  [44.848, 41.700],
];

// ─── Elevation profile ────────────────────────────────────────────────────────

const ELEV_DATA = [
  { pct: 0,   elev: 490,  label: 'Tbilisi' },
  { pct: 8,   elev: 467,  label: null },
  { pct: 18,  elev: 1740, label: 'Kazbegi' },
  { pct: 27,  elev: 2200, label: null },
  { pct: 36,  elev: 2926, label: 'Abano Pass' },
  { pct: 44,  elev: 1900, label: 'Tusheti' },
  { pct: 60,  elev: 500,  label: null },
  { pct: 72,  elev: 800,  label: 'Sighnaghi' },
  { pct: 84,  elev: 700,  label: null },
  { pct: 100, elev: 490,  label: null },
];

const VW = 1000, VH = 170;
const PAD = { t: 36, r: 14, b: 28, l: 42 };
const CW = VW - PAD.l - PAD.r;
const CH = VH - PAD.t - PAD.b;
const MAX_E = 3200;
const ex = (pct: number) => PAD.l + (pct / 100) * CW;
const ey = (elev: number) => PAD.t + CH - (elev / MAX_E) * CH;

const elevPts = ELEV_DATA.map(d => ({ ...d, x: ex(d.pct), y: ey(d.elev) }));
const linePath = elevPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
const areaPath = `${linePath} L${ex(100).toFixed(1)},${(PAD.t + CH).toFixed(1)} L${ex(0).toFixed(1)},${(PAD.t + CH).toFixed(1)} Z`;

export function ElevationProfile() {
  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Elevation Profile</h2>
        <p className="text-sm text-slate-500">
          Abano Pass (2 926 m) is the crux — loose shale, sheer drops, no barriers
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-3 pt-2 pb-1">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f97316" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* gridlines */}
          {[1000, 2000, 3000].map(e => (
            <g key={e}>
              <line x1={PAD.l} y1={ey(e)} x2={VW - PAD.r} y2={ey(e)} stroke="#e2e8f0" strokeWidth="1" />
              <text x={PAD.l - 6} y={ey(e) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="system-ui,sans-serif">
                {e === 1000 ? '1 k' : e === 2000 ? '2 k' : '3 k'}
              </text>
            </g>
          ))}

          {/* area + line */}
          <path d={areaPath} fill="url(#eGrad)" />
          <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* labeled points */}
          {elevPts.filter(p => p.label).map(p => {
            const isPeak = p.label === 'Abano Pass';
            const anchor = p.pct < 10 ? 'start' : p.pct > 85 ? 'end' : 'middle';
            return (
              <g key={p.label!}>
                <circle cx={p.x} cy={p.y} r={isPeak ? 5 : 4} fill={isPeak ? '#ef4444' : '#f97316'} stroke="white" strokeWidth="1.5" />
                <text x={p.x} y={p.y - (isPeak ? 24 : 12)} textAnchor={anchor}
                  fontSize={isPeak ? 11 : 10} fontWeight={isPeak ? '700' : '500'}
                  fill={isPeak ? '#ef4444' : '#374151'} fontFamily="system-ui,sans-serif">
                  {p.label}
                </text>
                {isPeak && (
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fill="#ef4444" fontFamily="system-ui,sans-serif">
                    2 926 m
                  </text>
                )}
              </g>
            );
          })}

          {/* baseline label */}
          <text x={PAD.l - 6} y={ey(0) + 4} textAnchor="end" fontSize="10" fill="#cbd5e1" fontFamily="system-ui,sans-serif">0</text>
        </svg>
      </div>
    </section>
  );
}

// ─── Map ──────────────────────────────────────────────────────────────────────

export function TripMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<MaplibreMap | null>(null);
  const markersRef   = useRef<Marker[]>([]);
  const rafRef       = useRef<number | null>(null);
  const styleKeyRef  = useRef<keyof typeof STYLE_URLS>('terrain');
  const [styleKey, setStyleKey] = useState<keyof typeof STYLE_URLS>('terrain');

  const toggleStyle = () => {
    const next: keyof typeof STYLE_URLS = styleKeyRef.current === 'terrain' ? 'satellite' : 'terrain';
    styleKeyRef.current = next;
    setStyleKey(next);
    mapRef.current?.setStyle(STYLE_URLS[next]);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    let dead = false;

    import('maplibre-gl').then(({ default: mgl }) => {
      if (dead || !containerRef.current) return;

      const map = new mgl.Map({
        container: containerRef.current,
        style: STYLE_URLS.terrain,
        center: [44.95, 42.05],
        zoom: 7.0,
        pitch: 52,
        bearing: -8,
        antialias: true,
      });
      mapRef.current = map;
      map.addControl(new mgl.NavigationControl(), 'top-right');

      const addLayers = () => {
        // cancel any running draw animation
        if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        // drop old markers (DOM elements survive style swaps)
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // 3D terrain (works with both base styles)
        map.addSource('terrain', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 256,
        });
        map.setTerrain({ source: 'terrain', exaggeration: 1.6 });

        // route source — starts at the first coordinate only
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [ROUTE_COORDS[0], ROUTE_COORDS[0]] } },
        });
        map.addLayer({ id: 'route-glow', type: 'line', source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#f97316', 'line-width': 12, 'line-opacity': 0.18, 'line-blur': 6 } });
        map.addLayer({ id: 'route-line', type: 'line', source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#f97316', 'line-width': 3.5, 'line-opacity': 1 } });

        // animated draw
        let step = 0;
        const TOTAL = 160;
        const tick = () => {
          step++;
          const t = step / TOTAL;
          const raw = t * (ROUTE_COORDS.length - 1);
          const lo = Math.floor(raw), hi = Math.min(lo + 1, ROUTE_COORDS.length - 1);
          const f = raw - lo;
          const tip: [number, number] = [
            ROUTE_COORDS[lo][0] + (ROUTE_COORDS[hi][0] - ROUTE_COORDS[lo][0]) * f,
            ROUTE_COORDS[lo][1] + (ROUTE_COORDS[hi][1] - ROUTE_COORDS[lo][1]) * f,
          ];
          (map.getSource('route') as GeoJSONSource)?.setData({
            type: 'Feature', properties: {},
            geometry: { type: 'LineString', coordinates: [...ROUTE_COORDS.slice(0, lo + 1), tip] },
          });
          if (step < TOTAL) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            (map.getSource('route') as GeoJSONSource)?.setData({
              type: 'Feature', properties: {},
              geometry: { type: 'LineString', coordinates: ROUTE_COORDS },
            });
          }
        };
        rafRef.current = requestAnimationFrame(tick);

        // pins
        STOPS.forEach((stop, idx) => {
          const isStart = idx === 0, isEnd = idx === STOPS.length - 1;
          const bg = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#f97316';
          const el = document.createElement('div');
          Object.assign(el.style, {
            width: '26px', height: '26px', borderRadius: '50%', background: bg,
            border: '2.5px solid white', boxShadow: '0 2px 10px rgba(0,0,0,.5)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '800', color: 'white',
            fontFamily: 'system-ui,sans-serif', lineHeight: '1',
          });
          el.textContent = String(idx + 1);

          const dayLabel = stop.endDay > stop.day ? `Days ${stop.day}–${stop.endDay}` : `Day ${stop.day}`;
          const popup = new mgl.Popup({ offset: 16, closeButton: false, maxWidth: '260px' }).setHTML(`
            <div style="font-family:system-ui,sans-serif;padding:10px 14px;line-height:1.5">
              <div style="font-size:10px;color:#64748b;margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">${stop.country} · ${dayLabel}</div>
              <div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:5px">${stop.name}</div>
              <div style="font-size:12px;color:#475569;line-height:1.45">${stop.highlight}</div>
            </div>`);

          const marker = new mgl.Marker({ element: el }).setLngLat(stop.coords).setPopup(popup).addTo(map);
          markersRef.current.push(marker);
        });
      };

      // style.load fires on initial load AND after setStyle() — handles both cases
      map.on('style.load', addLayers);
    });

    return () => {
      dead = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">7-Day Route</h2>
          <p className="text-sm text-slate-500">3D terrain · click any pin for details</p>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">~750 km · all Georgia</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-md">
        <div ref={containerRef} className="h-[540px] w-full" />
        <button
          onClick={toggleStyle}
          className="absolute bottom-3 left-3 z-10 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow backdrop-blur-sm transition-colors hover:bg-white"
        >
          {styleKey === 'terrain' ? 'Satellite view' : 'Terrain view'}
        </button>
      </div>
    </section>
  );
}
