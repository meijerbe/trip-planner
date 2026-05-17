'use client';

import { useEffect, useRef } from 'react';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY!;

// Edit stops here — order determines the route polyline
const STOPS = [
  { day: 1, name: 'Tbilisi',  coords: [44.833, 41.694] as [number, number] },
  { day: 3, name: 'Kazbegi',  coords: [44.654, 42.657] as [number, number] },
  { day: 5, name: 'Gori',     coords: [44.109, 41.985] as [number, number] },
  { day: 7, name: 'Kutaisi',  coords: [42.703, 42.268] as [number, number] },
  { day: 9, name: 'Batumi',   coords: [41.642, 41.642] as [number, number] },
];

export function TripMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamic import keeps MapLibre out of the SSR bundle
    let map: import('maplibre-gl').Map;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      import('maplibre-gl/dist/maplibre-gl.css' as never);

      map = new maplibregl.Map({
        container: containerRef.current!,
        style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`,
        center: [43.4, 42.1],
        zoom: 6.8,
        pitch: 55,
        bearing: -10,
        antialias: true,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.on('load', () => {
        // 3D terrain
        map.addSource('terrain', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 256,
        });
        map.setTerrain({ source: 'terrain', exaggeration: 1.5 });

        // Route line
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: STOPS.map((s) => s.coords),
            },
          },
        });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#f59e0b', 'line-width': 3, 'line-opacity': 0.9 },
        });

        // Pins + popups
        for (const stop of STOPS) {
          const el = document.createElement('div');
          el.style.cssText = [
            'width:14px', 'height:14px',
            'border-radius:50%',
            'background:#f59e0b',
            'border:2.5px solid #1e3a5f',
            'box-shadow:0 2px 6px rgba(0,0,0,.35)',
            'cursor:pointer',
          ].join(';');

          const popup = new maplibregl.Popup({ offset: 20, closeButton: false })
            .setHTML(
              `<div style="font-family:system-ui,sans-serif;padding:6px 10px;line-height:1.4">
                <div style="font-size:11px;color:#64748b;margin-bottom:2px">Day ${stop.day}</div>
                <div style="font-size:14px;font-weight:600;color:#1e3a5f">${stop.name}</div>
              </div>`,
            );

          new maplibregl.Marker({ element: el })
            .setLngLat(stop.coords)
            .setPopup(popup)
            .addTo(map);
        }
      });
    });

    return () => map?.remove();
  }, []);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Trip Route</h2>
        <p className="text-sm text-muted-foreground">
          3D map of our journey through Georgia — click a pin to see the stop.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div ref={containerRef} className="h-[440px] w-full" />
      </div>
    </section>
  );
}
