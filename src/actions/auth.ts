"use server";

import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSessionCookie,
  destroySession,
  getSession,
  SessionUser,
} from "@/lib/auth/session";

export interface AuthState {
  error?: string;
  success?: boolean;
}

/**
 * Standard Sign-in action with municipality and department matching
 */
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const phoneOrNationalId = formData.get("identifier")?.toString().trim();
  const password = formData.get("password")?.toString();
  const selectedMunicipalityId = formData.get("municipalityId")?.toString();
  const selectedDepartmentId = formData.get("departmentId")?.toString();

  if (!phoneOrNationalId || !password) {
    return { error: "تکایە ژمارەی مۆبایل یان ناسنامەی نیشتمانی و وشەی نهێنی بنووسە." };
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
    return { error: "بەکارهێنەر نەدۆزرایەوە یان زانیارییەکان هەڵەن." };
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return { error: "وشەی نهێنی هەڵەیە، تکایە دووبارە هەوڵبدەرەوە." };
  }

  // Optional: check if selected municipality matches user's registered municipality
  if (selectedMunicipalityId && selectedMunicipalityId !== user.municipalityId) {
    return {
      error: `ئەم هەژمارە سەر بە "${user.municipality.nameKrd}"ـە نەک شارەوانی دیاریکراو.`,
    };
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

  await createSessionCookie(sessionUser);

  // Log successful login to AuditLog
  try {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_SIGN_IN",
        entity: "User",
        entityId: user.id,
        changesJson: {
          municipality: user.municipality.nameEng,
          role: user.role,
        },
      },
    });
  } catch (err) {
    // Non-critical audit log fail
  }

  redirect("/dashboard");
}

/**
 * Quick demo login for fast testing of specific roles
 */
export async function quickDemoLogin(identifierOrRole: string) {
  let user = null;

  if (identifierOrRole === "DG" || identifierOrRole === "DIRECTOR_GENERAL" || identifierOrRole === "07701500001") {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: "07701500001" },
          { role: "DIRECTOR_GENERAL" },
        ],
      },
      include: { municipality: true, department: true },
    });
  } else if (identifierOrRole === "MAYOR_KALAR" || identifierOrRole === "07701500002") {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: "07701500002" },
          { role: "MAYOR", municipality: { code: "GM-KLR" } },
        ],
      },
      include: { municipality: true, department: true },
    });
  } else if (identifierOrRole === "ENGINEER_KIFRI" || identifierOrRole === "ENG_KIFRI") {
    user = await prisma.user.findFirst({
      where: {
        role: "ENGINEER",
        municipality: { code: "GM-KFR" },
      },
      include: { municipality: true, department: true },
    });

    if (!user) {
      const kifri = await prisma.municipality.findFirst({
        where: { code: "GM-KFR" },
      });
      if (kifri) {
        let engDept = await prisma.department.findFirst({
          where: { municipalityId: kifri.id, code: "ENG" },
        });
        if (!engDept) {
          engDept = await prisma.department.create({
            data: {
              municipalityId: kifri.id,
              name: "بەشی ئەندازە و پڕۆژەکان",
              code: "ENG",
            },
          });
        }
        const defaultPasswordHash = await bcrypt.hash("Garmian@2026", 10);
        user = await prisma.user.create({
          data: {
            fullName: "ئەندازیار محەمەد سەعید (کفری)",
            phone: "07701500015",
            nationalId: "199112345695",
            passwordHash: defaultPasswordHash,
            role: "ENGINEER",
            municipalityId: kifri.id,
            departmentId: engDept.id,
          },
          include: { municipality: true, department: true },
        });
      }
    }
  } else if (identifierOrRole === "ACCOUNTANT_RIZGARI" || identifierOrRole === "FIN_RIZGARI") {
    user = await prisma.user.findFirst({
      where: {
        role: "FINANCE_OFFICER",
        municipality: { code: "GM-RZG" },
      },
      include: { municipality: true, department: true },
    });

    if (!user) {
      const rizgari = await prisma.municipality.findFirst({
        where: { code: "GM-RZG" },
      });
      if (rizgari) {
        let finDept = await prisma.department.findFirst({
          where: { municipalityId: rizgari.id, code: "FIN" },
        });
        if (!finDept) {
          finDept = await prisma.department.create({
            data: {
              municipalityId: rizgari.id,
              name: "بەشی دارایی و ژمێریاری",
              code: "FIN",
            },
          });
        }
        const defaultPasswordHash = await bcrypt.hash("Garmian@2026", 10);
        user = await prisma.user.create({
          data: {
            fullName: "ژمێریار کاروان حەمە ڕەشید (ڕزگاری)",
            phone: "07701500016",
            nationalId: "198912345696",
            passwordHash: defaultPasswordHash,
            role: "FINANCE_OFFICER",
            municipalityId: rizgari.id,
            departmentId: finDept.id,
          },
          include: { municipality: true, department: true },
        });
      }
    }
  } else {
    // Fallback search by phone or ID
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifierOrRole },
          { nationalId: identifierOrRole },
        ],
      },
      include: {
        municipality: true,
        department: true,
      },
    });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      include: { municipality: true, department: true },
    });
  }

  if (!user) {
    let hq = await prisma.municipality.findFirst({ where: { isHeadquarter: true } });
    if (!hq) {
      hq = await prisma.municipality.create({
        data: {
          code: "GM-HQ",
          nameKrd: "بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان",
          nameEng: "General Directorate of Municipalities of Garmian",
          tier: "HEADQUARTER" as any,
          isHeadquarter: true,
        },
      });
    }
    const defaultPasswordHash = await bcrypt.hash("Garmian@2026", 10);
    user = await prisma.user.create({
      data: {
        fullName: "ئەندازیار بەرزان محەمەد ئەحمەد",
        phone: "07701500001",
        nationalId: "198012345678",
        passwordHash: defaultPasswordHash,
        role: "DIRECTOR_GENERAL" as any,
        municipalityId: hq.id,
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

  await createSessionCookie(sessionUser);
  redirect("/dashboard");
}

/**
 * Sign out action
 */
export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

/**
 * Get current session user on server
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return await getSession();
}

