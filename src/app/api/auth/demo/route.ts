import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  SessionUser,
} from "@/lib/auth/session";

interface DemoRoleConfig {
  key: string;
  role: any;
  fullName: string;
  phone: string;
  nationalId: string;
  muniCode: string;
  muniNameKrd: string;
  muniNameEng: string;
  tier: any;
  isHeadquarter: boolean;
  deptCode?: string;
  deptName?: string;
}

const DEMO_ROLES: Record<string, DemoRoleConfig> = {
  DG: {
    key: "DG",
    role: "DIRECTOR_GENERAL",
    fullName: "ئەندازیار بەرزان محەمەد ئەحمەد",
    phone: "07701500001",
    nationalId: "198012345678",
    muniCode: "GM-HQ",
    muniNameKrd: "بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان",
    muniNameEng: "General Directorate of Municipalities of Garmian",
    tier: "HEADQUARTER",
    isHeadquarter: true,
    deptCode: "ADM",
    deptName: "بەشی کارگێڕی و ئەرشیف (EDMS)",
  },
  MAYOR_KALAR: {
    key: "MAYOR_KALAR",
    role: "MAYOR",
    fullName: "ئەکرەم ساڵح کەریم",
    phone: "07701500002",
    nationalId: "198212345679",
    muniCode: "GM-KLR",
    muniNameKrd: "سەرۆکایەتی شارەوانی کەلار",
    muniNameEng: "Kalar Municipality Directorate",
    tier: "TIER_1",
    isHeadquarter: false,
    deptCode: "ADM",
    deptName: "سەرۆکایەتی شارەوانی",
  },
  MAYOR_KIFRI: {
    key: "MAYOR_KIFRI",
    role: "MAYOR",
    fullName: "سەردار فەتاح محەمەد",
    phone: "07701500003",
    nationalId: "198512345680",
    muniCode: "GM-KFR",
    muniNameKrd: "سەرۆکایەتی شارەوانی کفری",
    muniNameEng: "Kifri Municipality Directorate",
    tier: "TIER_1",
    isHeadquarter: false,
    deptCode: "ADM",
    deptName: "سەرۆکایەتی شارەوانی",
  },
  MAYOR_RIZGARI: {
    key: "MAYOR_RIZGARI",
    role: "MAYOR",
    fullName: "عوسمان جەلال حەسەن",
    phone: "07701500014",
    nationalId: "198412345688",
    muniCode: "GM-RZG",
    muniNameKrd: "شارەوانی ڕزگاری (سمود)",
    muniNameEng: "Rizgari Municipality",
    tier: "TIER_2",
    isHeadquarter: false,
    deptCode: "ADM",
    deptName: "سەرۆکایەتی شارەوانی",
  },
  ENGINEER: {
    key: "ENGINEER",
    role: "ENGINEER",
    fullName: "ئەندازیار شوان کامەران قادر",
    phone: "07701500005",
    nationalId: "199212345682",
    muniCode: "GM-HQ",
    muniNameKrd: "بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان",
    muniNameEng: "General Directorate of Municipalities of Garmian",
    tier: "HEADQUARTER",
    isHeadquarter: true,
    deptCode: "ENG",
    deptName: "بەشی ئەندازە و پڕۆژەکان",
  },
  LAND_OFFICER: {
    key: "LAND_OFFICER",
    role: "LAND_OFFICER",
    fullName: "سامان نەجمەدین فەرەج (زەویوزار)",
    phone: "07701500004",
    nationalId: "199012345681",
    muniCode: "GM-KLR",
    muniNameKrd: "سەرۆکایەتی شارەوانی کەلار",
    muniNameEng: "Kalar Municipality Directorate",
    tier: "TIER_1",
    isHeadquarter: false,
    deptCode: "GIS",
    deptName: "بەشی زەویوزار، نەخشە و GIS",
  },
  FINANCE_OFFICER: {
    key: "FINANCE_OFFICER",
    role: "FINANCE_OFFICER",
    fullName: "ژمێریار کاروان حەمە ڕەشید (ڕزگاری)",
    phone: "07701500016",
    nationalId: "198912345696",
    muniCode: "GM-RZG",
    muniNameKrd: "شارەوانی ڕزگاری (سمود)",
    muniNameEng: "Rizgari Municipality",
    tier: "TIER_2",
    isHeadquarter: false,
    deptCode: "FIN",
    deptName: "بەشی دارایی و ژمێریاری",
  },
};

// Aliases
DEMO_ROLES["DIRECTOR_GENERAL"] = DEMO_ROLES["DG"];
DEMO_ROLES["ENGINEER_KIFRI"] = DEMO_ROLES["ENGINEER"];
DEMO_ROLES["ACCOUNTANT_RIZGARI"] = DEMO_ROLES["FINANCE_OFFICER"];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawRoleKey = body?.role || "DG";
    const config = DEMO_ROLES[rawRoleKey] || DEMO_ROLES["DG"];

    // 1. Ensure Municipality exists
    let municipality = await prisma.municipality.findFirst({
      where: {
        OR: [
          { code: config.muniCode },
          { nameKrd: { contains: config.muniNameKrd.split(" ")[1] || config.muniNameKrd } },
        ],
      },
    });

    if (!municipality) {
      municipality = await prisma.municipality.create({
        data: {
          code: config.muniCode,
          nameKrd: config.muniNameKrd,
          nameEng: config.muniNameEng,
          tier: config.tier,
          isHeadquarter: config.isHeadquarter,
        },
      });
    }

    // 2. Ensure Department exists if applicable
    let department = null;
    if (config.deptCode) {
      department = await prisma.department.findFirst({
        where: {
          municipalityId: municipality.id,
          code: config.deptCode,
        },
      });

      if (!department) {
        department = await prisma.department.create({
          data: {
            municipalityId: municipality.id,
            name: config.deptName || "بەشی سەرەکی",
            code: config.deptCode,
          },
        });
      }
    }

    // 3. Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: config.phone },
          { nationalId: config.nationalId },
          {
            role: config.role,
            municipalityId: municipality.id,
          },
        ],
      },
      include: { municipality: true, department: true },
    });

    if (!user) {
      const defaultPasswordHash = await bcrypt.hash("Garmian@2026", 10);
      user = await prisma.user.create({
        data: {
          fullName: config.fullName,
          phone: config.phone,
          nationalId: config.nationalId,
          passwordHash: defaultPasswordHash,
          role: config.role,
          municipalityId: municipality.id,
          departmentId: department?.id || null,
        },
        include: { municipality: true, department: true },
      });
    }

    const sessionUser: SessionUser = {
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
      nationalId: user.nationalId,
      role: user.role,
      municipalityId: user.municipalityId,
      municipalityNameKrd: user.municipality.nameKrd,
      municipalityCode: user.municipality.code,
      isHeadquarter: user.municipality.isHeadquarter,
      departmentId: user.departmentId,
    };

    const token = await signSessionToken(sessionUser);

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "DEMO_QUICK_SIGN_IN",
          entity: "User",
          entityId: user.id,
          changesJson: {
            role: user.role,
            roleKey: config.key,
            municipality: user.municipality.nameEng || user.municipality.nameKrd,
          },
        },
      });
    } catch {
      // Non-critical
    }

    const response = NextResponse.json({
      success: true,
      redirect: "/dashboard",
      user: {
        id: user.id,
        name: user.fullName,
        role: user.role,
        municipality: user.municipality.nameKrd,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: error?.message || "هەڵەیەک ڕوویدا لە کاتی گۆڕینی ئەکاونت." },
      { status: 500 }
    );
  }
}
