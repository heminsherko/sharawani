import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  SessionUser,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phoneOrNationalId = body?.identifier?.toString().trim();
    const password = body?.password?.toString();
    const selectedMunicipalityId = body?.municipalityId?.toString();
    const selectedDepartmentId = body?.departmentId?.toString();

    if (!phoneOrNationalId || !password) {
      return NextResponse.json(
        { error: "تکایە ژمارەی مۆبایل یان ناسنامەی نیشتمانی و وشەی نهێنی بنووسە." },
        { status: 400 }
      );
    }

    // Find user by phone or national ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phoneOrNationalId },
          { nationalId: phoneOrNationalId },
        ],
      },
      include: {
        municipality: true,
        department: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "بەکارهێنەر نەدۆزرایەوە یان زانیارییەکان هەڵەن." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "وشەی نهێنی هەڵەیە، تکایە دووبارە هەوڵبدەرەوە." },
        { status: 401 }
      );
    }

    // Check municipality match if selected
    if (selectedMunicipalityId && selectedMunicipalityId !== user.municipalityId) {
      return NextResponse.json(
        {
          error: `ئەم هەژمارە سەر بە "${user.municipality.nameKrd}"ـە نەک شارەوانی دیاریکراو.`,
        },
        { status: 403 }
      );
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
          action: "USER_SIGN_IN",
          entity: "User",
          entityId: user.id,
          changesJson: {
            municipality: user.municipality.nameEng || user.municipality.nameKrd,
            role: user.role,
          },
        },
      });
    } catch {
      // Non-critical audit log fail
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە." },
      { status: 500 }
    );
  }
}

