"use client";

import "leaflet/dist/leaflet.css";
import * as React from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Tooltip,
  useMapEvents,
  useMap,
  Marker,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { ParcelDTO } from "@/actions/parcels";
import { Map as MapIcon, Globe, Crosshair } from "lucide-react";

// Zero-Defect: Pure inline SVG DivIcon factory - NO external PNG assets, eliminates all 404s
export function createSvgDivIcon(color: string = "#017E84", label?: string, number?: string) {
  return L.divIcon({
    className: "custom-svg-pin",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
        <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
          <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25c0-8.284-6.716-15-15-15z" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="15" cy="15" r="5.5" fill="#FFFFFF"/>
        </svg>
        ${
          label || number
            ? `<div style="background: rgba(15, 23, 42, 0.92); color: #FFFFFF; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: 'Noto Kufi Arabic', system-ui, sans-serif; font-weight: 700; white-space: nowrap; margin-top: 2px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 2px 5px rgba(0,0,0,0.3); direction: rtl;">
                ${number ? `<span style="color: #38bdf8; font-family: monospace; font-size: 11px;">#${number}</span> ` : ""}
                ${label || ""}
              </div>`
            : ""
        }
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38],
  });
}

const defaultPointIcon = createSvgDivIcon("#017E84");

interface GarmianMapProps {
  parcels: ParcelDTO[];
  onSelectParcel: (parcel: ParcelDTO) => void;
  selectedParcelId?: string | null;
  drawingMode?: boolean;
  drawnPoints: [number, number][];
  onPointAdded?: (point: [number, number]) => void;
  hasOverlap?: boolean;
  conflictingParcelId?: string | null;
}

// Robust MapResizer: Forces map.invalidateSize() at 100ms, 300ms, and 800ms after container mount
function MapResizer() {
  const map = useMap();
  React.useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
}

// MapFlyController: Smoothly pans and zooms camera to target coordinates
function MapFlyController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (target) {
      map.flyTo(target, 16, { animate: true, duration: 1.0 });
    }
  }, [target, map]);
  return null;
}

// Sub-component to capture map click events when in polygon drawing mode
function MapDrawingHandler({
  drawingMode,
  onPointAdded,
}: {
  drawingMode?: boolean;
  onPointAdded?: (point: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      if (drawingMode && onPointAdded) {
        onPointAdded([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export default function GarmianMap({
  parcels,
  onSelectParcel,
  selectedParcelId,
  drawingMode = false,
  drawnPoints = [],
  onPointAdded,
  hasOverlap = false,
  conflictingParcelId = null,
}: GarmianMapProps) {
  // Center of Garmian / Kalar: Latitude 34.633, Longitude 45.315
  const garmianCenter: [number, number] = [34.633, 45.315];
  const [mapType, setMapType] = React.useState<"osm" | "satellite">("satellite");

  // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
  const parseCoordinates = React.useCallback((coordinatesJson: any): [number, number][] => {
    if (!coordinatesJson) return [];

    try {
      if (coordinatesJson.type === "Polygon" && coordinatesJson.coordinates) {
        const ring = coordinatesJson.coordinates[0];
        if (Array.isArray(ring)) {
          return ring.map((c: any) => [c[1], c[0]]);
        }
      }
    } catch (e) {
      console.error("Error parsing polygon coordinates:", e);
    }
    return [];
  }, []);

  // Compute fly target when selected parcel changes
  const selectedParcel = React.useMemo(
    () => parcels.find((p) => p.id === selectedParcelId),
    [parcels, selectedParcelId]
  );

  const flyTarget = React.useMemo<[number, number] | null>(() => {
    if (!selectedParcel) return null;
    const coords = parseCoordinates(selectedParcel.coordinatesJson);
    if (coords.length === 0) return null;
    const avgLat = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
    const avgLng = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
    return [avgLat, avgLng];
  }, [selectedParcel, parseCoordinates]);

  // Strict Institutional Semantic Color System
  const getParcelStyle = React.useCallback((parcel: ParcelDTO, isSelected: boolean) => {
    // If this parcel is in spatial collision with the drawn parcel: highlight in bright amber/gold
    if (parcel.id === conflictingParcelId) {
      return {
        fillColor: "#f59e0b",
        color: "#d97706",
        weight: 5,
        fillOpacity: 0.85,
        dashArray: "4, 4",
      };
    }

    let fillColor = "#10b981"; // Emerald/Green: سەوزایی و پارکی سیروان
    let color = "#047857";

    if (parcel.status === "DISPUTED" || parcel.usageType.includes("سەرپێچی")) {
      fillColor = "#ef4444"; // Crimson/Red: سەرپێچی و زیادەڕۆیی
      color = "#b91c1c";
    } else if (parcel.usageType.includes("بازرگانی") || parcel.status === "RESERVED") {
      fillColor = "#f59e0b"; // Amber/Gold: زۆنی بازرگانی
      color = "#d97706";
    } else if (parcel.usageType.includes("نیشتەجێ") || parcel.status === "ALLOCATED") {
      fillColor = "#2563eb"; // Navy/Blue: نیشتەجێبوون
      color = "#1d4ed8";
    } else if (
      parcel.usageType.includes("سەوزایی") ||
      parcel.usageType.includes("باخچە") ||
      parcel.status === "VACANT"
    ) {
      fillColor = "#10b981"; // Emerald/Green
      color = "#047857";
    }

    return {
      fillColor: isSelected ? "#714B67" : fillColor,
      color: isSelected ? "#4A2843" : color,
      weight: isSelected ? 4 : 2,
      fillOpacity: isSelected ? 0.85 : 0.52,
    };
  }, [conflictingParcelId]);

  return (
    <div
      style={{ height: "650px", width: "100%", position: "relative" }}
      className="relative h-[650px] min-h-[650px] w-full rounded border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
    >
      {/* Map Imagery Toggle Controls */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-1 shadow-md backdrop-blur-xs select-none">
        <button
          type="button"
          onClick={() => setMapType("satellite")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
            mapType === "satellite"
              ? "bg-[#017E84] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>مانگی دەستکرد (Satellite)</span>
        </button>

        <button
          type="button"
          onClick={() => setMapType("osm")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
            mapType === "osm"
              ? "bg-[#017E84] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          <span>نەخشەی سەرشەقام (Street)</span>
        </button>
      </div>

      {/* Drawing Mode Notification */}
      {drawingMode && (
        <div className="absolute top-3 right-3 z-[400] rounded border border-emerald-500/40 bg-emerald-950/90 text-emerald-200 px-3 py-1.5 text-xs backdrop-blur-xs flex items-center gap-2 shadow-lg animate-pulse">
          <Crosshair className="h-4 w-4 text-emerald-400" />
          <span>دۆخی کێشانی سنووری زەوی: کلیک لەسەر نەخشە بکە بۆ دیاریکردنی خاڵەکان</span>
        </div>
      )}

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={garmianCenter}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "650px" }}
        className="h-full w-full"
      >
        {/* Automatic robust map invalidation / sizing trigger */}
        <MapResizer />

        {/* Fly to selected parcel */}
        <MapFlyController target={flyTarget} />

        {/* Map Layers */}
        {mapType === "osm" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}

        {/* Drawing event handler */}
        <MapDrawingHandler
          drawingMode={drawingMode}
          onPointAdded={onPointAdded}
        />

        {/* Live Drawing Points & Polyline using custom SVG DivIcons */}
        {drawingMode && drawnPoints.length > 0 && (
          <>
            <Polyline
              positions={drawnPoints}
              pathOptions={{
                color: hasOverlap ? "#ef4444" : "#017E84",
                weight: hasOverlap ? 4 : 3,
                dashArray: hasOverlap ? "4, 4" : "6, 6",
              }}
            />
            {drawnPoints.length >= 3 && (
              <Polygon
                positions={drawnPoints}
                pathOptions={{
                  className: hasOverlap ? "overlap-alert-polygon" : undefined,
                  fillColor: hasOverlap ? "#ef4444" : "#017E84",
                  color: hasOverlap ? "#b91c1c" : "#00676C",
                  fillOpacity: hasOverlap ? 0.65 : 0.4,
                  weight: hasOverlap ? 4 : 2.5,
                  dashArray: hasOverlap ? "4, 4" : undefined,
                }}
              />
            )}
            {drawnPoints.map((pt, idx) => (
              <Marker
                key={idx}
                position={pt}
                icon={createSvgDivIcon(
                  hasOverlap ? "#ef4444" : "#017E84",
                  hasOverlap ? `خاڵی ${idx + 1} (تێکەڵبوون)` : `خاڵی ${idx + 1}`
                )}
              />
            ))}
          </>
        )}

        {/* Saved Cadastre Polygons with Hover Highlighting & Kurdish Tooltips */}
        {parcels.map((parcel) => {
          const positions = parseCoordinates(parcel.coordinatesJson);
          if (positions.length < 3) return null;

          const isSelected = parcel.id === selectedParcelId;
          const isConflicting = parcel.id === conflictingParcelId;
          const style = getParcelStyle(parcel, isSelected);

          return (
            <Polygon
              key={parcel.id}
              positions={positions}
              pathOptions={style}
              eventHandlers={{
                click: () => onSelectParcel(parcel),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({ weight: isConflicting ? 6 : 4, fillOpacity: 0.85 });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle(getParcelStyle(parcel, parcel.id === selectedParcelId));
                },
              }}
            >
              {/* Clean floating Kurdish Tooltip on hover */}
              <Tooltip sticky direction="top" opacity={0.96}>
                <div className="p-1 text-right font-sans select-none" dir="rtl">
                  {isConflicting && (
                    <div className="mb-1 rounded bg-amber-500 text-white px-1.5 py-0.5 text-[10px] font-bold">
                      ⚠️ سنوری ئەم پارچەیە تێکەڵ بووە!
                    </div>
                  )}
                  <div className="font-bold text-xs text-slate-900">{parcel.zoneNumber}</div>
                  <div className="text-[11px] font-mono text-[#017E84] font-bold">
                    پارچەی {parcel.parcelNumber}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    {parcel.areaSqm} م² • {parcel.usageType}
                  </div>
                </div>
              </Tooltip>

              {/* Click Popup */}
              <Popup className="kurdish-popup text-right font-sans">
                <div className="p-1.5 text-right font-sans" dir="rtl">
                  {isConflicting && (
                    <div className="mb-2 p-1.5 rounded bg-amber-50 border border-amber-300 text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                      <span>⚠️ سنوری ئەم پارچەیە بەریەککەوتنی ئەندازیاری هەیە لەگەڵ سنورە کێشراوە نوێیەکە!</span>
                    </div>
                  )}
                  <div className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1">
                    پارچەی: {parcel.parcelNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    کەرتی: <span className="font-semibold text-slate-800">{parcel.zoneNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    ڕووبەر: <span className="font-mono font-bold text-slate-900">{parcel.areaSqm}</span> م²
                  </div>
                  <div className="text-[11px] text-slate-600">
                    بەکارهێنان: <span className="font-semibold text-slate-800">{parcel.usageType}</span>
                  </div>
                  <div className="text-[11px] font-bold mt-1 text-[#017E84]">
                    {parcel.ownerName || "موڵکی گشتی (شارەوانی)"}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectParcel(parcel)}
                      className="text-[10px] font-bold text-white bg-[#714B67] hover:bg-[#5C3C54] px-2 py-0.5 rounded cursor-pointer"
                    >
                      بینینی وردەکاری و سەنەد
                    </button>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}
