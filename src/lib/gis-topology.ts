import * as turf from "@turf/turf";
import { ParcelDTO } from "@/actions/parcels";

export interface OverlapValidationResult {
  hasOverlap: boolean;
  conflictingParcel?: ParcelDTO;
  overlapZone?: string;
  message?: string;
}

/**
 * Validates whether the drawn coordinates [lat, lng][] overlap with any existing parcel.
 * Uses Turf.js topology / booleanIntersects engine with automatic GeoJSON conversion.
 */
export function checkParcelOverlap(
  drawnPoints: [number, number][],
  existingParcels: ParcelDTO[],
  currentParcelId?: string
): OverlapValidationResult {
  if (!drawnPoints || drawnPoints.length < 3) {
    return { hasOverlap: false };
  }

  try {
    // Convert Leaflet [lat, lng] to GeoJSON [lng, lat] and close polygon ring
    const ring: [number, number][] = drawnPoints.map(([lat, lng]) => [lng, lat]);
    if (
      ring[0][0] !== ring[ring.length - 1][0] ||
      ring[0][1] !== ring[ring.length - 1][1]
    ) {
      ring.push([ring[0][0], ring[0][1]]);
    }

    const candidatePolygon = turf.polygon([ring]);

    for (const parcel of existingParcels) {
      // Ignore current parcel if editing
      if (currentParcelId && parcel.id === currentParcelId) {
        continue;
      }

      const coordsJson = parcel.coordinatesJson;
      if (!coordsJson) continue;

      let parcelPolygon: any = null;

      if (coordsJson.type === "Polygon" && Array.isArray(coordsJson.coordinates)) {
        parcelPolygon = turf.polygon(coordsJson.coordinates);
      } else if (Array.isArray(coordsJson)) {
        // If stored as array of points
        const pRing: [number, number][] = coordsJson.map((c: any) => [c[1], c[0]]);
        if (
          pRing[0][0] !== pRing[pRing.length - 1][0] ||
          pRing[0][1] !== pRing[pRing.length - 1][1]
        ) {
          pRing.push([pRing[0][0], pRing[pRing.length - 1][1]]);
        }
        parcelPolygon = turf.polygon([pRing]);
      }

      if (parcelPolygon) {
        const intersects = turf.booleanIntersects(candidatePolygon, parcelPolygon);
        if (intersects) {
          return {
            hasOverlap: true,
            conflictingParcel: parcel,
            overlapZone: parcel.zoneNumber,
            message: `سنوورەکەی تێکەڵ دەبێت لەگەڵ پارچە زەوی ژمارە ${parcel.parcelNumber} لە کەرتی ${parcel.zoneNumber}`,
          };
        }
      }
    }

    return {
      hasOverlap: false,
      message: "هیچ تێکەڵبوونێکی سنور و زیادەڕۆیی لەم پارچەیەدا نییە.",
    };
  } catch (err) {
    console.error("Spatial overlap validation error:", err);
    return { hasOverlap: false };
  }
}

/**
 * Predefined Cadastre Simulations for Garmian (Kalar Center)
 */
export const CADASTRE_SIMULATIONS = {
  // Collides with existing parcel 142/12 (کەرتی 12 شێروانە)
  OVERLAP_INTENTIONAL: {
    name: "تاقیکردنەوەی تێکەڵبوون بە مەبەست (Test Overlap Simulation)",
    zoneNumber: "کەرتی 12 شێروانە",
    parcelNumber: "142/99-تەداخول",
    areaSqm: 260,
    status: "DISPUTED" as const,
    usageType: "نیشتەجێبوون (Residential)",
    points: [
      [34.6315, 45.3170],
      [34.6332, 45.3170],
      [34.6332, 45.3188],
      [34.6315, 45.3188],
    ] as [number, number][],
  },

  // Safe vacant plot in clear zone near Kalar center
  CLEAN_SAFE: {
    name: "پارچەی دروست و بێ کێشە (Clean Plot Simulation)",
    zoneNumber: "کەرتی ٤ بەرانان - زۆنی نوێ",
    parcelNumber: "89/10-ڕێپێدراو",
    areaSqm: 250,
    status: "VACANT" as const,
    usageType: "نیشتەجێبوون (Residential)",
    points: [
      [34.6265, 45.3135],
      [34.6285, 45.3135],
      [34.6285, 45.3155],
      [34.6265, 45.3155],
    ] as [number, number][],
  },
};

