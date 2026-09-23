"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Category, Locale } from "@/lib/types";
import {
  comparisonIds,
  readMapView,
  selectedMapEntry,
} from "@/lib/atlas-state";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from "d3-zoom";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

export interface MapPreview {
  id: string;
  label: string;
  summary: string;
  image: string | null;
}

export interface MapTradition {
  id: string;
  category: Category;
  intro: string;
  comparisonOptions: { id: string; label: string }[];
  label: string;
  color: string;
  anchor: { lat: number; lon: number };
  countries: number[];
  entryCount: number;
  region: string;
  featured: MapPreview[];
  hasCosmogony: boolean;
}

export interface MapPin extends MapPreview {
  id: string;
  label: string;
  lat: number;
  lon: number;
  color: string;
  traditionId: string;
}

const W = 960;
const H = 540;
const PIN_REVEAL_SCALE = 1.65;
const ANCHOR_MIN_DISTANCE = 44;
const ANCHOR_LAYOUT_SCALES = [0.7, 0.82, 1, 1.25];

const LABEL_TWEAKS: Record<
  string,
  { dx?: number; dy?: number; anchor?: "start" | "end" }
> = {
  abrahamic: { anchor: "end", dx: -11, dy: -2 },
  mesopotamian: { dy: -10 },
  persian: { dy: 10 },
  arabian: { dy: 10 },
  korean: { anchor: "end", dx: -11, dy: -5 },
  japanese: { dy: -8 },
  kaidan: { dy: 11 },
  greek: { anchor: "end", dx: -11 },
  celtic: { anchor: "end", dx: -11, dy: -5 },
  shanhaijing: { dy: -9 },
  chinese: { dy: 11 },
  "american-folklore": { dy: 11 },
  cthulhu: { anchor: "end", dx: -12, dy: 12 },
  scp: { dy: 10 },
  "native-american": { dy: -8 },
  maya: { anchor: "end", dx: -11, dy: 9 },
  aztec: { anchor: "end", dx: -11, dy: -5 },
};

interface Tip {
  title: string;
  sub?: string;
}

interface PinPlacement extends MapPin {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

function resolveAnchorOffsets(
  placements: Array<{ id: string; x: number; y: number }>,
) {
  const offsets = placements.map(() => ({ x: 0, y: 0 }));

  for (let iteration = 0; iteration < 320; iteration += 1) {
    let moved = false;
    for (const scale of ANCHOR_LAYOUT_SCALES) {
      for (let i = 0; i < placements.length; i += 1) {
        for (let j = i + 1; j < placements.length; j += 1) {
          let dx =
            (placements[j].x - placements[i].x) * scale +
            offsets[j].x -
            offsets[i].x;
          let dy =
            (placements[j].y - placements[i].y) * scale +
            offsets[j].y -
            offsets[i].y;
          let distance = Math.hypot(dx, dy);
          if (distance >= ANCHOR_MIN_DISTANCE) continue;
          if (distance < 0.001) {
            const angle = (((i * 47 + j * 29) % 360) * Math.PI) / 180;
            dx = Math.cos(angle);
            dy = Math.sin(angle);
            distance = 1;
          }
          const push = (ANCHOR_MIN_DISTANCE - distance) * 0.27;
          const unitX = dx / distance;
          const unitY = dy / distance;
          offsets[i].x -= unitX * push;
          offsets[i].y -= unitY * push;
          offsets[j].x += unitX * push;
          offsets[j].y += unitY * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  return new Map(
    placements.map((placement, index) => [placement.id, offsets[index]]),
  );
}

export default function WorldMap({
  traditions,
  pins,
  locale,
}: {
  traditions: MapTradition[];
  pins: MapPin[];
  locale: Locale;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const zoomLabelRef = useRef<HTMLSpanElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(
    null,
  );
  const zoomScaleRef = useRef(1);
  const mobileCenteredRef = useRef(false);
  const [world, setWorld] = useState<FeatureCollection<Geometry> | null>(null);
  const [mapError, setMapError] = useState(false);
  const params = useSearchParams();
  const selectedTid = traditions.some((t) => t.id === params.get("realm"))
    ? params.get("realm")
    : null;
  const selectedEntryId = params.get("pin");
  const animationRef = useRef<number | null>(null);
  const suppressViewWrite = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [retry, setRetry] = useState(0);
  const allOptions = traditions.flatMap((t) =>
    t.comparisonOptions.map((option) => ({ ...option, storyId: t.id })),
  );
  const compared = comparisonIds(params.get("compare"), allOptions);
  const selectedCollection = traditions.find((t) => t.id === selectedTid);
  const collectionsLayer =
    params.get("layer") === "collections" ||
    (!params.has("layer") &&
      selectedCollection?.category !== undefined &&
      selectedCollection.category !== "pantheon");
  const visibleTraditions = traditions.filter((t) =>
    collectionsLayer ? t.category !== "pantheon" : t.category === "pantheon",
  );
  const [previewTid, setPreviewTid] = useState<string | null>(null);
  const [zoomPins, setZoomPins] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  const projection = useMemo(
    () =>
      geoNaturalEarth1().fitExtent(
        [
          [10, 10],
          [W - 10, H - 10],
        ],
        { type: "Sphere" },
      ),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const spherePath = useMemo(
    () => path({ type: "Sphere" }) ?? undefined,
    [path],
  );
  const graticulePath = useMemo(
    () => path(geoGraticule10()) ?? undefined,
    [path],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch("/map/countries-110m.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`map data ${response.status}`);
        return response.json();
      })
      .then((topo: Topology) => {
        setWorld(
          feature(topo, topo.objects.countries) as FeatureCollection<Geometry>,
        );
        setMapError(false);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMapError(true);
      });
    return () => controller.abort();
  }, [retry]);

  const syncMarkerScale = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // SVG meet letterboxes a wide or tall canvas: the actual map scale is
    // constrained by both dimensions, not just its CSS width.
    const rect = svg.getBoundingClientRect();
    const screenScale = Math.min(rect.width / W, rect.height / H) || 1;
    const markerScale = 1 / (zoomScaleRef.current * screenScale);
    select(svg)
      .selectAll<SVGGElement, unknown>("[data-map-marker]")
      .attr("transform", `scale(${markerScale})`);
  }, []);

  // Measure only after layout or a completed gesture, never on pointer movement.
  const settleLabels = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const occupied: DOMRect[] = [];
    const anchors = [
      ...svg.querySelectorAll<SVGGElement>(".map-tradition-anchor"),
    ].sort(
      (a, b) =>
        Number(b.dataset.selected === "true") -
        Number(a.dataset.selected === "true"),
    );
    for (const anchor of anchors) {
      const label = anchor.querySelector<SVGTextElement>("text");
      if (!label) continue;
      const box = label.getBoundingClientRect();
      const selected = anchor.dataset.selected === "true";
      const visible =
        selected ||
        (box.left >= bounds.left + 4 &&
          box.right <= bounds.right - 4 &&
          box.top >= bounds.top &&
          box.bottom <= bounds.bottom &&
          !occupied.some(
            (other) =>
              box.left < other.right + 7 &&
              box.right + 7 > other.left &&
              box.top < other.bottom + 5 &&
              box.bottom + 5 > other.top,
          ));
      label.style.visibility = visible ? "visible" : "hidden";
      if (visible) occupied.push(box);
    }
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const svg = select(svgElement);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [W, H],
      ])
      .scaleExtent([1, 9])
      .translateExtent([
        [0, 0],
        [W, H],
      ])
      .clickDistance(6)
      .filter((event) => {
        if (event.type === "wheel") return event.ctrlKey || event.metaKey;
        if (event.type.startsWith("touch")) return event.touches?.length >= 2;
        return !event.button;
      })
      .on("start", (event) => {
        if (event.sourceEvent && animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
          suppressViewWrite.current = false;
        }
      })
      .on("end", (event) => {
        if (suppressViewWrite.current) return;
        requestAnimationFrame(settleLabels);
        const url = new URL(window.location.href);
        url.searchParams.set("z", event.transform.k.toFixed(3));
        url.searchParams.set("x", event.transform.x.toFixed(1));
        url.searchParams.set("y", event.transform.y.toFixed(1));
        window.history.replaceState(
          null,
          "",
          `${url.pathname}${url.search}#atlas`,
        );
      })
      .on("zoom", (event) => {
        zoomScaleRef.current = event.transform.k;
        select(contentRef.current).attr(
          "transform",
          event.transform.toString(),
        );
        syncMarkerScale();
        if (zoomLabelRef.current)
          zoomLabelRef.current.textContent = `${event.transform.k.toFixed(1)}×`;
        const shouldReveal = event.transform.k >= PIN_REVEAL_SCALE;
        setZoomPins((current) =>
          current === shouldReveal ? current : shouldReveal,
        );
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);
    syncMarkerScale();
    return () => {
      if (animationRef.current !== null)
        cancelAnimationFrame(animationRef.current);
      svg.on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, [projection, traditions, syncMarkerScale, settleLabels]);

  const viewZ = params.get("z");
  const viewX = params.get("x");
  const viewY = params.get("y");
  useEffect(() => {
    const svg = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svg || !behavior) return;
    const viewParams = new URLSearchParams();
    if (viewZ) viewParams.set("z", viewZ);
    if (viewX) viewParams.set("x", viewX);
    if (viewY) viewParams.set("y", viewY);
    const view = readMapView(viewParams, W, H);
    const current = zoomTransform(svg);
    if (
      Math.abs(current.k - view.k) < 0.002 &&
      Math.abs(current.x - view.x) < 0.2 &&
      Math.abs(current.y - view.y) < 0.2
    )
      return;
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    suppressViewWrite.current = true;
    select(svg).call(
      behavior.transform,
      zoomIdentity.translate(view.x, view.y).scale(view.k),
    );
    suppressViewWrite.current = false;
    requestAnimationFrame(settleLabels);
  }, [viewZ, viewX, viewY, settleLabels]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const updateLayout = () => {
      syncMarkerScale();
      settleLabels();
      const canvas = containerRef.current;
      if (!canvas) return;
      if (canvas.clientWidth < 640 && canvas.scrollWidth > canvas.clientWidth) {
        if (!mobileCenteredRef.current) {
          canvas.scrollLeft = (canvas.scrollWidth - canvas.clientWidth) / 2;
          mobileCenteredRef.current = true;
        }
      } else {
        mobileCenteredRef.current = false;
      }
    };
    const observer = new ResizeObserver(updateLayout);
    observer.observe(svg);
    updateLayout();
    return () => observer.disconnect();
  }, [syncMarkerScale, settleLabels]);

  useEffect(() => {
    syncMarkerScale();
    settleLabels();
  }, [selectedTid, collectionsLayer, zoomPins, syncMarkerScale, settleLabels]);

  const countries = useMemo(
    () =>
      world?.features.map((shape, index) => ({
        key: shape.id == null ? `country-${index}` : `country-${shape.id}`,
        id: Number(shape.id),
        d: path(shape) ?? undefined,
      })) ?? [],
    [path, world],
  );

  const traditionPlacements = useMemo(
    () =>
      traditions
        .filter((t) =>
          collectionsLayer
            ? t.category !== "pantheon"
            : t.category === "pantheon",
        )
        .flatMap((tradition) => {
          const position = projection([
            tradition.anchor.lon,
            tradition.anchor.lat,
          ]);
          return position
            ? [{ ...tradition, x: position[0], y: position[1] }]
            : [];
        }),
    [projection, traditions, collectionsLayer],
  );

  const anchorOffsets = useMemo(
    () => resolveAnchorOffsets(traditionPlacements),
    [traditionPlacements],
  );

  const pinPlacements = useMemo<PinPlacement[]>(() => {
    const totals = new Map<string, number>();
    for (const pin of pins) {
      const key = `${pin.lat},${pin.lon}`;
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }

    const indices = new Map<string, number>();
    return pins.flatMap((pin) => {
      const position = projection([pin.lon, pin.lat]);
      if (!position) return [];
      const key = `${pin.lat},${pin.lon}`;
      const total = totals.get(key) ?? 1;
      const index = indices.get(key) ?? 0;
      indices.set(key, index + 1);
      const radius = total === 1 ? 0 : total === 2 ? 13 : 17;
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / total;
      return [
        {
          ...pin,
          x: position[0],
          y: position[1],
          offsetX: Math.cos(angle) * radius,
          offsetY: Math.sin(angle) * radius,
        },
      ];
    });
  }, [pins, projection]);

  const activeTid = selectedTid;
  const activeTradition = selectedTid
    ? (traditions.find((tradition) => tradition.id === selectedTid) ?? null)
    : null;
  const selectedEntry = selectedMapEntry(
    selectedEntryId,
    activeTradition?.featured ?? [],
    pins,
    selectedTid,
  );
  const returnTo = `/${locale}${params.size ? `?${params}` : ""}#atlas`;

  function updateSelection(realm: string | null, pin?: string) {
    const url = new URL(window.location.href);
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    suppressViewWrite.current = false;
    if (svgRef.current) {
      const view = zoomTransform(svgRef.current);
      url.searchParams.set("z", view.k.toFixed(3));
      url.searchParams.set("x", view.x.toFixed(1));
      url.searchParams.set("y", view.y.toFixed(1));
    }
    if (realm) url.searchParams.set("realm", realm);
    else url.searchParams.delete("realm");
    if (pin) url.searchParams.set("pin", pin);
    else url.searchParams.delete("pin");
    const target = traditions.find((t) => t.id === realm);
    if (target)
      url.searchParams.set(
        "layer",
        target.category === "pantheon" ? "traditions" : "collections",
      );
    window.history.pushState(null, "", `${url.pathname}${url.search}#atlas`);
    setExpanded(false);
    if (realm && window.matchMedia("(max-width: 760px)").matches)
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ block: "nearest" }),
      );
  }
  const revealPins = zoomPins && activeTid !== null;

  function showTip(event: React.PointerEvent, title: string, sub?: string) {
    const canvas = containerRef.current;
    const box = canvas?.getBoundingClientRect();
    if (!canvas || !box) return;
    const left =
      canvas.scrollLeft +
      Math.max(12, Math.min(event.clientX - box.left + 16, box.width - 190));
    const top =
      canvas.scrollTop +
      Math.max(12, Math.min(event.clientY - box.top + 12, box.height - 72));
    const position = () => {
      if (!tipRef.current) return;
      tipRef.current.style.left = `${left}px`;
      tipRef.current.style.top = `${top}px`;
    };
    setTip((current) =>
      current?.title === title && current.sub === sub
        ? current
        : { title, sub },
    );
    position();
    if (!tipRef.current) requestAnimationFrame(position);
  }

  function chooseTradition(id: string) {
    updateSelection(id);
    setPreviewTid(null);
    setTip(null);
    const target = traditions.find((t) => t.id === id);
    const point = target && projection([target.anchor.lon, target.anchor.lat]);
    const svg = svgRef.current;
    if (point && svg) {
      const view = zoomTransform(svg);
      const [x, y] = view.apply(point);
      if (x < 35 || x > W - 35 || y < 35 || y > H - 35)
        animateView({
          k: view.k,
          x: Math.max(W * (1 - view.k), Math.min(0, W / 2 - point[0] * view.k)),
          y: Math.max(H * (1 - view.k), Math.min(0, H / 2 - point[1] * view.k)),
        });
    }
  }

  function animateView(target: { k: number; x: number; y: number }) {
    const svg = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svg || !behavior) return;
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    const from = zoomTransform(svg);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    const frame = (time: number) => {
      const progress = reduced ? 1 : Math.min(1, (time - start) / 320);
      const eased = 1 - Math.pow(1 - progress, 3);
      suppressViewWrite.current = progress < 1;
      select(svg).call(
        behavior.transform,
        zoomIdentity
          .translate(
            from.x + (target.x - from.x) * eased,
            from.y + (target.y - from.y) * eased,
          )
          .scale(from.k + (target.k - from.k) * eased),
      );
      animationRef.current = progress < 1 ? requestAnimationFrame(frame) : null;
    };
    animationRef.current = requestAnimationFrame(frame);
  }

  function focusTradition(id: string) {
    const target = traditions.find((tradition) => tradition.id === id);
    const point = target && projection([target.anchor.lon, target.anchor.lat]);
    if (point && svgRef.current && zoomBehaviorRef.current) {
      const k = 2.2;
      const transform = zoomIdentity
        .translate(
          Math.max(W * (1 - k), Math.min(0, W / 2 - point[0] * k)),
          Math.max(H * (1 - k), Math.min(0, H / 2 - point[1] * k)),
        )
        .scale(k);
      animateView(transform);
    }
  }

  function zoomBy(factor: number) {
    const svg = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svg || !behavior) return;
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    suppressViewWrite.current = false;
    select(svg).call(behavior.scaleBy, factor);
  }

  function resetMap() {
    animateView({ k: 1, x: 0, y: 0 });
    setPreviewTid(null);
    setTip(null);
  }

  function closePanel() {
    updateSelection(null);
    requestAnimationFrame(() =>
      document.getElementById("atlas-realm")?.focus(),
    );
  }

  function updateComparison(ids: string[]) {
    const url = new URL(window.location.href);
    url.searchParams.set("compare", ids.join(","));
    window.history.pushState(null, "", `${url.pathname}${url.search}#atlas`);
  }

  return (
    <div
      className="world-map-shell atlas-explorer atlas-redesign"
      data-selected={Boolean(activeTradition)}
      data-expanded={expanded}
    >
      <div className="atlas-toolbar">
        <label htmlFor="atlas-realm">
          {locale === "zh" ? "选择神话体系" : "Choose a tradition"}
        </label>
        <select
          id="atlas-realm"
          value={selectedTid ?? ""}
          onChange={(event) =>
            event.target.value
              ? chooseTradition(event.target.value)
              : closePanel()
          }
        >
          <option value="">
            {locale === "zh" ? "选择一个传统…" : "Choose a tradition…"}
          </option>
          {visibleTraditions.map((tradition) => (
            <option key={tradition.id} value={tradition.id}>
              {tradition.label}
            </option>
          ))}
        </select>
        <label htmlFor="atlas-layer">
          {locale === "zh" ? "图层" : "Layer"}
        </label>
        <select
          id="atlas-layer"
          value={collectionsLayer ? "collections" : "traditions"}
          onChange={(event) => {
            const url = new URL(window.location.href);
            url.searchParams.set("layer", event.target.value);
            url.searchParams.delete("realm");
            url.searchParams.delete("pin");
            window.history.pushState(
              null,
              "",
              `${url.pathname}${url.search}#atlas`,
            );
            setPreviewTid(null);
            setTip(null);
          }}
        >
          <option value="traditions">
            {locale === "zh" ? "地域与文化传统" : "Cultural traditions"}
          </option>
          <option value="collections">
            {locale === "zh" ? "典籍、怪谈与创作" : "Texts, folklore & fiction"}
          </option>
        </select>
      </div>
      <div className="atlas-workspace">
        <div className="atlas-map-column">
          <div className="map-command-bar">
            <div className="map-legend" aria-hidden="true">
              <span>
                <i className="map-legend-node" />
                <span className="map-legend-label">
                  {locale === "zh" ? "传统入口" : "tradition"}
                </span>
              </span>
              <span>
                <i className="map-legend-pin" />
                <span className="map-legend-label">
                  {locale === "zh" ? "传说坐标" : "legendary site"}
                </span>
              </span>
            </div>
            <p>
              {locale === "zh"
                ? "选择光点，预览故事"
                : "Select a beacon to explore"}
            </p>
            <div
              className="map-controls"
              aria-label={
                locale === "zh" ? "神话图卷缩放" : "Map zoom controls"
              }
            >
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.45)}
                aria-label={locale === "zh" ? "缩小神话图卷" : "Zoom out"}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10" />
                </svg>
              </button>
              <span ref={zoomLabelRef} className="map-zoom-readout">
                1.0×
              </span>
              <button
                type="button"
                onClick={() => zoomBy(1.45)}
                aria-label={locale === "zh" ? "放大神话图卷" : "Zoom in"}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M8 3v10" />
                </svg>
              </button>
              <button type="button" className="map-reset" onClick={resetMap}>
                {locale === "zh" ? "全球" : "World"}
              </button>
            </div>
          </div>

          <p className="map-mobile-hint">
            <span aria-hidden="true">↔</span>
            {locale === "zh"
              ? "点选传统 · 双指移动地图 · 单指滚动页面"
              : "Tap a tradition · two fingers to move · one to scroll"}
          </p>

          <div ref={containerRef} className="map-canvas">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="world-map-svg"
              role="group"
              aria-label={
                locale === "zh"
                  ? "可交互世界神话图卷"
                  : "Interactive world mythology atlas"
              }
            >
              <g ref={contentRef}>
                <path
                  d={spherePath}
                  fill="#142126"
                  stroke="rgba(235,221,190,0.62)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  className="map-fade-1"
                />
                <path
                  d={graticulePath}
                  fill="none"
                  stroke="rgba(230,220,194,0.2)"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                  className="map-fade-1"
                />

                <g className="map-fade-2">
                  {countries.map((country) => {
                    return (
                      <path
                        key={country.key}
                        d={country.d}
                        fill="rgba(230,220,194,0.12)"
                        stroke="rgba(230,220,194,0.3)"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                        className="map-country"
                      />
                    );
                  })}
                </g>

                {pinPlacements.map((pin) => {
                  const active = activeTid === pin.traditionId;
                  const visible =
                    revealPins &&
                    active &&
                    visibleTraditions.some((t) => t.id === pin.traditionId);
                  if (!visible) return null;
                  return (
                    <g
                      key={pin.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedEntryId === pin.id}
                      onClick={() => updateSelection(pin.traditionId, pin.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          updateSelection(pin.traditionId, pin.id);
                        }
                      }}
                      aria-label={pin.label}
                      className="map-pin-link"
                    >
                      <g transform={`translate(${pin.x},${pin.y})`}>
                        <g data-map-marker>
                          <g
                            transform={`translate(${pin.offsetX},${pin.offsetY})`}
                            onPointerMove={(event) => showTip(event, pin.label)}
                            onPointerLeave={() => setTip(null)}
                            className="map-entry-marker"
                          >
                            <circle r="12" fill="transparent" />
                            <path
                              d="M0,-5 L3.8,0 L0,5 L-3.8,0 Z"
                              fill={pin.color}
                              opacity={active ? 1 : 0.86}
                              stroke="#0b1114"
                              strokeWidth="0.8"
                            />
                          </g>
                        </g>
                      </g>
                    </g>
                  );
                })}

                {traditionPlacements.map((tradition, index) => {
                  const tweak = LABEL_TWEAKS[tradition.id] ?? {};
                  const anchorOffset = anchorOffsets.get(tradition.id) ?? {
                    x: 0,
                    y: 0,
                  };
                  const active =
                    activeTid === tradition.id || previewTid === tradition.id;
                  const selected = selectedTid === tradition.id;
                  return (
                    <g
                      key={tradition.id}
                      transform={`translate(${tradition.x},${tradition.y})`}
                      data-selected={selected}
                      data-hovered={previewTid === tradition.id}
                      data-detail={zoomPins}
                      onClick={() => chooseTradition(tradition.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          chooseTradition(tradition.id);
                        }
                      }}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse")
                          setPreviewTid(tradition.id);
                      }}
                      onPointerMove={(event) =>
                        showTip(
                          event,
                          tradition.label,
                          `${tradition.entryCount} ${locale === "zh" ? "则异闻" : "records"}`,
                        )
                      }
                      onPointerLeave={(event) => {
                        if (event.pointerType === "mouse") setPreviewTid(null);
                        setTip(null);
                      }}
                      onFocus={() => setPreviewTid(tradition.id)}
                      onBlur={() => setPreviewTid(null)}
                      className="map-tradition-anchor"
                    >
                      <g data-map-marker>
                        <g
                          transform={`translate(${anchorOffset.x},${anchorOffset.y})`}
                        >
                          <circle
                            r="12"
                            fill="transparent"
                            className="map-anchor-hit"
                            data-tradition-id={tradition.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${tradition.label}, ${tradition.entryCount} ${locale === "zh" ? "则异闻" : "records"}`}
                            aria-pressed={selected}
                          />
                          <g
                            className="map-anchor-node"
                            data-active={active ? "true" : "false"}
                            style={{
                              animationDelay: `${-index * 0.31}s`,
                              animationDuration: `${4.8 + (index % 5) * 0.42}s`,
                              filter: active
                                ? `drop-shadow(0 0 12px ${tradition.color})`
                                : undefined,
                            }}
                          >
                            <circle
                              r="9.4"
                              fill={
                                active
                                  ? `${tradition.color}26`
                                  : "rgba(233, 215, 169, 0.1)"
                              }
                              className="map-anchor-aura"
                            />
                            <circle
                              r="13"
                              fill="none"
                              stroke={active ? tradition.color : "#ead9a9"}
                              strokeWidth="1.1"
                              strokeDasharray="13 69"
                              strokeLinecap="round"
                              className="map-anchor-orbit"
                              style={{
                                animationDelay: `${-index * 0.53}s`,
                                animationDuration: `${9 + (index % 6) * 0.8}s`,
                              }}
                            />
                            <circle
                              r="6.2"
                              fill={
                                active
                                  ? `${tradition.color}45`
                                  : "rgba(226, 208, 163, 0.16)"
                              }
                              stroke={
                                active
                                  ? tradition.color
                                  : "rgba(238, 220, 174, 0.9)"
                              }
                              strokeWidth="0.9"
                              className="map-anchor-halo"
                            />
                            <circle
                              r={active ? 3.2 : 2.65}
                              fill={active ? tradition.color : "#f0d88f"}
                              className="map-anchor-core"
                            />
                            <circle
                              cx="11.2"
                              cy="-3"
                              r="1.2"
                              fill={active ? tradition.color : "#f1e1b8"}
                              className="map-anchor-satellite"
                            />
                          </g>
                          <text
                            x={tweak.dx ?? 12}
                            y={tweak.dy ?? 0}
                            textAnchor={tweak.anchor ?? "start"}
                            dominantBaseline="middle"
                            fontSize="11"
                            fill={active ? "#fff7e5" : "#ddd1b8"}
                            stroke="#111b20"
                            strokeWidth="3.5"
                            paintOrder="stroke"
                            data-active={active ? "true" : "false"}
                            className="map-anchor-label"
                          >
                            {tradition.label}
                          </text>
                        </g>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {mapError ? (
              <p className="map-error" role="status">
                {locale === "zh"
                  ? "神话图卷未能展开，请稍后重试。"
                  : "The base atlas could not be opened. Please try again."}
                <button
                  onClick={() => {
                    setMapError(false);
                    setRetry((value) => value + 1);
                  }}
                >
                  {locale === "zh" ? "重试" : "Retry"}
                </button>
              </p>
            ) : null}

            {tip ? (
              <div ref={tipRef} className="map-tip">
                <span>{tip.title}</span>
                {tip.sub ? (
                  <span className="ml-2 catalog-no">{tip.sub}</span>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="atlas-geography-note">
            {locale === "zh"
              ? "点位是阅读入口，并非精确起源地或古代疆域。按住 Ctrl / ⌘ 滚轮缩放；无定位内容仍可在图鉴中阅读。"
              : "Points are reading gateways, not exact origins or historical borders. Ctrl / ⌘ + scroll to zoom. Unlocated stories remain in the collection."}
          </p>
        </div>
        <aside
          ref={panelRef}
          className="atlas-reading-panel"
          aria-label={locale === "zh" ? "地图故事预览" : "Map story preview"}
        >
          {activeTradition && (
            <div className="atlas-panel-controls">
              <span role="status">{activeTradition.label}</span>
              <button
                className="atlas-panel-expand"
                aria-expanded={expanded}
                aria-controls="atlas-panel-content"
                onClick={() => setExpanded(!expanded)}
              >
                {locale === "zh"
                  ? expanded
                    ? "收起"
                    : "展开"
                  : expanded
                    ? "Collapse"
                    : "Expand"}
              </button>
              <button
                onClick={closePanel}
                aria-label={locale === "zh" ? "关闭详情" : "Close details"}
              >
                ×
              </button>
            </div>
          )}
          <div id="atlas-panel-content">
            {selectedEntry ? (
              <div key={selectedEntry.id} className="atlas-preview">
                <button
                  className="atlas-back"
                  onClick={() => updateSelection(selectedTid)}
                >
                  {locale === "zh"
                    ? "返回精选故事"
                    : "Back to selected stories"}
                </button>
                {selectedEntry.image && (
                  <div className="atlas-preview-image">
                    <Image
                      src={selectedEntry.image}
                      alt={selectedEntry.label}
                      fill
                      sizes="(max-width: 900px) 90vw, 320px"
                    />
                  </div>
                )}
                <p className="eyebrow">{activeTradition?.label}</p>
                <h3>{selectedEntry.label}</h3>
                <p>{selectedEntry.summary}</p>
                <Link
                  className="button-primary"
                  href={`/${locale}/entry/${selectedEntry.id}?returnTo=${encodeURIComponent(returnTo)}`}
                >
                  {locale === "zh" ? "阅读完整故事" : "Read the story"}
                </Link>
              </div>
            ) : activeTradition ? (
              <div key={activeTradition.id}>
                <p className="eyebrow">{activeTradition.region}</p>
                <h3>{activeTradition.label}</h3>
                <p className="atlas-overview">{activeTradition.intro}</p>
                <p className="atlas-panel-count">
                  {activeTradition.entryCount}{" "}
                  {locale === "zh"
                    ? `个条目 · 从这 ${activeTradition.featured.length} 则读起`
                    : `records · ${activeTradition.featured.length} places to begin`}
                </p>
                <div className="atlas-primary-actions">
                  <button
                    className="button-secondary"
                    onClick={() => focusTradition(activeTradition.id)}
                  >
                    {locale === "zh" ? "聚焦地区" : "Focus region"}
                  </button>
                  {activeTradition.hasCosmogony && (
                    <Link
                      className="button-primary"
                      href={`/${locale}/cosmogony?story=${activeTradition.id}&returnTo=${encodeURIComponent(returnTo)}#reader`}
                    >
                      {locale === "zh" ? "阅读创世" : "Read origins"}
                    </Link>
                  )}
                </div>
                {activeTradition.comparisonOptions.length > 0 ? (
                  <div className="atlas-compare-picker">
                    <label htmlFor="atlas-compare-account">
                      {locale === "zh"
                        ? "选择叙事，加入对比"
                        : "Choose an account to compare"}
                    </label>
                    <select
                      id="atlas-compare-account"
                      value=""
                      disabled={compared.length >= 3}
                      onChange={(event) => {
                        if (
                          event.target.value &&
                          !compared.includes(event.target.value) &&
                          compared.length < 3
                        )
                          updateComparison([...compared, event.target.value]);
                      }}
                    >
                      <option value="">
                        {locale === "zh"
                          ? compared.length >= 3
                            ? "已选满三条叙事"
                            : "添加叙事…"
                          : compared.length >= 3
                            ? "Three accounts selected"
                            : "Add an account…"}
                      </option>
                      {activeTradition.comparisonOptions.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                          disabled={compared.includes(option.id)}
                        >
                          {option.label}
                          {compared.includes(option.id) ? " ✓" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="atlas-panel-count">
                    {locale === "zh"
                      ? "此专题尚未整理可比较的创世叙事。"
                      : "No comparable origin narrative is available for this collection yet."}
                  </p>
                )}
                <div className="atlas-story-list">
                  {activeTradition.featured.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() =>
                        updateSelection(activeTradition.id, entry.id)
                      }
                    >
                      {entry.image && (
                        <Image
                          src={entry.image}
                          alt=""
                          width={76}
                          height={96}
                        />
                      )}
                      <span>
                        <strong>{entry.label}</strong>
                        <span>{entry.summary}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <Link
                  className="atlas-panel-link"
                  href={`/${locale}/tradition/${activeTradition.id}?returnTo=${encodeURIComponent(returnTo)}`}
                >
                  {locale === "zh" ? "查看全部条目" : "Explore this tradition"}
                </Link>
                {activeTradition.hasCosmogony && (
                  <Link
                    className="atlas-panel-link"
                    href={`/${locale}/cosmogony?story=${activeTradition.id}&returnTo=${encodeURIComponent(returnTo)}#reader`}
                  >
                    {locale === "zh" ? "阅读创世故事" : "Read its origin story"}
                  </Link>
                )}
                {["shanhaijing", "japanese", "korean"].includes(
                  activeTradition.id,
                ) && (
                  <Link
                    className="atlas-panel-link"
                    href={`/${locale}/themes/foxes?returnTo=${encodeURIComponent(returnTo)}`}
                  >
                    {locale === "zh"
                      ? "专题：东亚狐传说"
                      : "Reading trail: foxes of East Asia"}
                  </Link>
                )}
              </div>
            ) : (
              <div className="atlas-invitation">
                <p className="eyebrow">
                  {locale === "zh" ? "从这里出发" : "CHOOSE A FIRST CHAPTER"}
                </p>
                <h3>
                  {locale === "zh"
                    ? "世界很大，从一个故事开始。"
                    : "A whole world. One story at a time."}
                </h3>
                <p>
                  {locale === "zh"
                    ? "选择地图上的光点，或跟随一条阅读路线。"
                    : "Choose a beacon on the map, or follow a reading trail."}
                </p>
                {[
                  ["shanhaijing", "探索《山海经》", "Explore the Shanhaijing"],
                  ["greek", "探索希腊神话", "Explore Greek traditions"],
                  ["norse", "探索北欧神话", "Explore Norse traditions"],
                ].map(([id, zh, en], i) => (
                  <button key={id} onClick={() => chooseTradition(id)}>
                    <span>0{i + 1}</span>
                    {locale === "zh" ? zh : en}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
      <div
        className="atlas-comparison-tray"
        aria-label={locale === "zh" ? "对比清单" : "Comparison list"}
      >
        <span role="status">
          {locale === "zh"
            ? `已选 ${compared.length}/3 条叙事`
            : `${compared.length}/3 accounts selected`}
        </span>
        {compared.map((id) => (
          <button
            key={id}
            className="atlas-compare-chip"
            onClick={() =>
              updateComparison(compared.filter((item) => item !== id))
            }
            aria-label={`${locale === "zh" ? "移除" : "Remove"} ${allOptions.find((option) => option.id === id)?.label}`}
          >
            {allOptions.find((option) => option.id === id)?.label}{" "}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        {compared.length > 0 && (
          <button className="atlas-clear" onClick={() => updateComparison([])}>
            {locale === "zh" ? "清空对比" : "Clear comparison"}
          </button>
        )}
        {compared.length >= 2 ? (
          <Link
            className="button-primary"
            href={`/${locale}/cosmogony?compare=${encodeURIComponent(compared.join(","))}&returnTo=${encodeURIComponent(returnTo)}#compare`}
          >
            {locale === "zh" ? "打开时间线对比 →" : "Compare narratives →"}
          </Link>
        ) : (
          <span className="atlas-tray-hint">
            {locale === "zh"
              ? "从地图选择两条叙事，开始并读。"
              : "Choose two accounts from the map to compare."}
          </span>
        )}
      </div>
    </div>
  );
}
