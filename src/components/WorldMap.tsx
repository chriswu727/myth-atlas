"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

export interface MapTradition {
  id: string;
  label: string;
  color: string;
  anchor: { lat: number; lon: number };
  countries: number[];
  entryCount: number;
}

export interface MapPin {
  id: string;
  label: string;
  lat: number;
  lon: number;
  color: string;
  traditionId: string;
}

/* hand-tuned label offsets for crowded regions (px at base scale) */
const LABEL_TWEAKS: Record<string, { dx?: number; dy?: number; anchor?: "start" | "end" }> = {
  abrahamic: { anchor: "end", dx: -8, dy: -2 },
  mesopotamian: { dy: -7 },
  persian: { dy: 8 },
  arabian: { dy: 8 },
  korean: { anchor: "end", dx: -8, dy: -4 },
  japanese: { dy: -6 },
  kaidan: { dy: 9 },
  greek: { anchor: "end", dx: -8 },
  celtic: { anchor: "end", dx: -8, dy: -4 },
  shanhaijing: { dy: -7 },
  chinese: { dy: 9 },
  "american-folklore": { dy: 9 },
  "native-american": { dy: -6 },
  maya: { anchor: "end", dx: -8, dy: 7 },
  aztec: { anchor: "end", dx: -8, dy: -4 },
};

interface Tip {
  x: number;
  y: number;
  title: string;
  sub?: string;
}

export default function WorldMap({
  traditions,
  pins,
  locale,
}: {
  traditions: MapTradition[];
  pins: MapPin[];
  locale: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [world, setWorld] = useState<FeatureCollection<Geometry> | null>(null);
  const [hoverTid, setHoverTid] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [t, setT] = useState<ZoomTransform>(zoomIdentity);

  const W = 960;
  const H = 540;

  const projection = useMemo(
    () => geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: "Sphere" }),
    []
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    let alive = true;
    fetch("/map/countries-110m.json")
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (!alive) return;
        setWorld(feature(topo, topo.objects.countries) as FeatureCollection<Geometry>);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 9])
      .translateExtent([[0, 0], [W, H]])
      .on("zoom", (ev) => setT(ev.transform));
    svg.call(z);
    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  const countryOwner = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const tr of traditions) {
      for (const c of tr.countries) {
        if (!m.has(c)) m.set(c, []);
        m.get(c)!.push(tr.id);
      }
    }
    return m;
  }, [traditions]);

  const hoverColor = hoverTid ? traditions.find((tr) => tr.id === hoverTid)?.color : null;

  function showTip(ev: React.MouseEvent, title: string, sub?: string) {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ x: ev.clientX - box.left + 14, y: ev.clientY - box.top + 10, title, sub });
  }

  return (
    <div ref={containerRef} className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label={locale === "zh" ? "世界神话地图" : "World mythology map"}
      >
        <g transform={t.toString()}>
          {/* celestial sphere + graticule: render immediately */}
          <path
            d={path({ type: "Sphere" }) ?? undefined}
            fill="var(--ink-well)"
            stroke="var(--brass-soft)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="map-fade-1"
          />
          <path
            d={path(geoGraticule10()) ?? undefined}
            fill="none"
            stroke="var(--brass-faint)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            className="map-fade-1"
          />

          {/* engraved coastlines */}
          {world && (
            <g className="map-fade-2">
              {world.features.map((f) => {
                const cid = Number(f.id);
                const owners = countryOwner.get(cid);
                const hovered = hoverTid != null && owners?.includes(hoverTid);
                return (
                  <path
                    key={String(f.id)}
                    d={path(f) ?? undefined}
                    fill={hovered && hoverColor ? `${hoverColor}44` : "rgba(195,165,94,0.055)"}
                    stroke="rgba(195,165,94,0.32)"
                    strokeWidth="0.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </g>
          )}

          {/* entry pins */}
          {pins.map((p) => {
            const pos = projection([p.lon, p.lat]);
            if (!pos) return null;
            const active = hoverTid === p.traditionId;
            return (
              <a key={p.id} href={`/${locale}/entry/${p.id}`} aria-label={p.label}>
                <g
                  transform={`translate(${pos[0]},${pos[1]}) scale(${1 / t.k})`}
                  onMouseMove={(ev) => showTip(ev, p.label)}
                  onMouseLeave={() => setTip(null)}
                  className="cursor-pointer"
                >
                  <circle r="8" fill="transparent" />
                  <path
                    d="M0,-4 L3,0 L0,4 L-3,0 Z"
                    fill={p.color}
                    opacity={active ? 1 : 0.75}
                    stroke="var(--ink-well)"
                    strokeWidth="0.6"
                  />
                </g>
              </a>
            );
          })}

          {/* tradition anchors: compass stars */}
          {traditions.map((tr, i) => {
            const pos = projection([tr.anchor.lon, tr.anchor.lat]);
            if (!pos) return null;
            const tweak = LABEL_TWEAKS[tr.id] ?? {};
            const active = hoverTid === tr.id;
            return (
              <a key={tr.id} href={`/${locale}/tradition/${tr.id}`} aria-label={tr.label}>
                <g
                  transform={`translate(${pos[0]},${pos[1]}) scale(${1 / t.k})`}
                  onMouseEnter={() => setHoverTid(tr.id)}
                  onMouseMove={(ev) =>
                    showTip(ev, tr.label, `${tr.entryCount} ${locale === "zh" ? "条目" : "entries"}`)
                  }
                  onMouseLeave={() => {
                    setHoverTid(null);
                    setTip(null);
                  }}
                  className="cursor-pointer map-marker"
                  style={{ animationDelay: `${0.5 + i * 0.045}s` }}
                >
                  <circle r="13" fill="transparent" />
                  <path
                    d="M0,-7 L1.9,-1.9 L7,0 L1.9,1.9 L0,7 L-1.9,1.9 L-7,0 L-1.9,-1.9 Z"
                    fill={tr.color}
                    stroke="var(--ink-well)"
                    strokeWidth="0.8"
                    style={active ? { filter: `drop-shadow(0 0 5px ${tr.color})` } : undefined}
                  />
                  <text
                    x={tweak.dx ?? 10}
                    y={tweak.dy ?? 0}
                    textAnchor={tweak.anchor ?? "start"}
                    dominantBaseline="middle"
                    fontSize="10"
                    fill={active ? tr.color : "var(--vellum-dim)"}
                    stroke="var(--ink)"
                    strokeWidth="3"
                    paintOrder="stroke"
                    style={{ fontFamily: "var(--font-cjk), var(--font-body-stack)", letterSpacing: "0.06em" }}
                  >
                    {tr.label}
                  </text>
                </g>
              </a>
            );
          })}
        </g>
      </svg>

      {tip && (
        <div className="map-tip" style={{ left: tip.x, top: tip.y }}>
          <span className="text-vellum">{tip.title}</span>
          {tip.sub && <span className="ml-2 catalog-no">{tip.sub}</span>}
        </div>
      )}
    </div>
  );
}
