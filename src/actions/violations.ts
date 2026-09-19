"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ParcelStatus } from "@prisma/client";

export interface ViolationSubmissionDTO {
  municipalityId: string;
  zone: string;
  description: string;
  offenderName?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  photoName?: string;
}

export interface ViolationListItemDTO {
  id: string;
  municipalityName: string;
  zone: string;
  parcelNumber: string;
  offenderName: string;
  description: string;
  status: string;
  createdAt: string;
  coordinates: [number, number];
}

/**
 * Log a new encroachment/violation from the mobile field inspector
 */
export async function submitViolationAction(
  data: ViolationSubmissionDTO
): Promise<{ success: boolean; error?: string; parcelId?: string }> {
  try {
    const user = await getSession();
    if (!user) {
      throw new Error("تکایە سەرەتا بچۆ ژوورەوە.");
    }

    if (!data.latitude || !data.longitude) {
      return { success: false, error: "تکایە تەنسیقاتی GPS دیاریبکە." };
    }

    if (!data.description || !data.description.trim()) {
      return { success: false, error: "تکایە وەسفی سەرپێچییەکە بنووسە." };
    }

    // Auto-generate violation parcel code
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const parcelNumber = `VIO-${randSuffix}`;
    const zoneNumber = data.zone?.trim() || "کەرتی زیادەڕۆیی";

    // Create a GeoJSON polygon around the live GPS coordinate (approx 50x50m)
    const lat = data.latitude;
    const lng = data.longitude;
    const delta = 0.0006; // bounding offset

    const coordinatesJson = {
      type: "Polygon",
      coordinates: [
        [
          [lng - delta, lat - delta],
          [lng + delta, lat - delta],
          [lng + delta, lat + delta],
          [lng - delta, lat + delta],
          [lng - delta, lat - delta],
        ],
      ],
      properties: {
        violation: true,
        reportedBy: user.fullName,
        description: data.description,
        accuracyMeters: data.accuracy,
      },
    };

    // 1. Create a DISPUTED parcel (renders highlighted in RED on the live GIS map)
    const newParcel = await prisma.parcel.create({
      data: {
        municipalityId: data.municipalityId || user.municipalityId,
        zoneNumber,
        parcelNumber,
        areaSqm: 200.0,
        status: ParcelStatus.DISPUTED, // Highlights in RED on Director General map
        usageType: "سەرپێچی سەر موڵکی گشتی (Encroachment Violation)",
        ownerName: data.offenderName?.trim() || "سەرپێچیکار (نەناسراو)",
        coordinatesJson,
      },
    });

    // 2. Dispatch High-Priority Alert into AuditLog
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "EMERGENCY_VIOLATION_ALERT",
        entity: "Parcel",
        entityId: newParcel.id,
        changesJson: {
          alertType: "RED_MAP_HIGHLIGHT",
          zone: zoneNumber,
          parcelNumber,
          offender: data.offenderName,
          description: data.description,
          lat,
          lng,
          accuracy: data.accuracy,
          municipalityId: data.municipalityId,
        },
      },
    });

    revalidatePath("/dashboard/parcels");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/violations");

    return { success: true, parcelId: newParcel.id };
  } catch (error: any) {
    console.error("Error logging violation:", error);
    return {
      success: false,
      error: error.message || "هەڵەیەک ڕوویدا لە تۆمارکردنی سەرپێچی.",
    };
  }
}

/**
 * Fetch all registered violations for the dashboard
 */
export async function getViolationsAction(): Promise<ViolationListItemDTO[]> {
  const user = await getSession();
  if (!user) return [];

  const whereClause: any = {
    status: ParcelStatus.DISPUTED,
  };

  if (!user.isHeadquarter) {
    whereClause.municipalityId = user.municipalityId;
  }

  const parcels = await prisma.parcel.findMany({
    where: whereClause,
    include: {
      municipality: { select: { nameKrd: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return parcels.map((p) => {
    let coords: [number, number] = [34.63, 45.31];
    try {
      const geo = p.coordinatesJson as any;
      if (geo?.coordinates?.[0]?.[0]) {
        coords = [geo.coordinates[0][0][1], geo.coordinates[0][0][0]];
      }
    } catch (e) {}

    return {
      id: p.id,
      municipalityName: p.municipality.nameKrd,
      zone: p.zoneNumber,
      parcelNumber: p.parcelNumber,
      offenderName: p.ownerName || "نەناسراو",
      description: p.usageType,
      status: "ناکۆک لەسەر / سەرپێچی",
      createdAt: p.createdAt.toISOString(),
      coordinates: coords,
    };
  });
}

