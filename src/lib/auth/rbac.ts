import { UserRole } from "@prisma/client";
import { SessionUser } from "./session";

export class UnauthorizedError extends Error {
  constructor(message = "تۆ دەسەڵاتی پێویستت نییە بۆ ئەم کردارە (Unauthorized)") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class MunicipalityScopeError extends Error {
  constructor(
    targetMunicipalityId: string,
    userMunicipalityId: string,
    message = "دەسەڵاتی شارەوانی ڕێگەپێدراو نییە: ناتوانیت دەستکاری یان زانیاری شارەوانییەکی تر بکەیت."
  ) {
    super(`${message} (Target: ${targetMunicipalityId}, User: ${userMunicipalityId})`);
    this.name = "MunicipalityScopeError";
  }
}

/**
 * Validates whether the user possesses the required role(s) and operates within their legal municipality boundary.
 *
 * Rules:
 * 1. Role validation: `user.role` must match `requiredRole` or be included in `requiredRole[]`.
 * 2. Cross-municipality access:
 *    - If `user.isHeadquarter === true` (General Directorate): They have legal authority across all 13 municipalities of Garmian.
 *    - If `user.isHeadquarter === false` (e.g., Kalar, Kifri): `targetMunicipalityId` MUST match `user.municipalityId`.
 *      Any attempt to access or mutate another municipality's records throws `MunicipalityScopeError`.
 */
export function assertPermission(
  user: SessionUser | null | undefined,
  requiredRole?: UserRole | UserRole[],
  targetMunicipalityId?: string
): asserts user is SessionUser {
  if (!user) {
    throw new UnauthorizedError("تکایە سەرەتا بچۆ ژوورەوە بۆ بەکارهێنانی سیستەمەکە.");
  }

  // 1. Role Verification
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // DIRECTOR_GENERAL inherently holds highest administrative authority
    const hasRole =
      user.role === UserRole.DIRECTOR_GENERAL || roles.includes(user.role);

    if (!hasRole) {
      throw new UnauthorizedError(
        `ڕۆڵی بەکارهێنەرەکەت (${user.role}) دەسەڵاتی ئەم کردارەی نییە. ڕۆڵی داواکراو: ${roles.join(", ")}`
      );
    }
  }

  // 2. Municipality Jurisdiction & Boundary Scope
  if (targetMunicipalityId) {
    if (user.isHeadquarter) {
      // General Directorate Headquarter staff can access and approve any sub-municipality
      return;
    }

    if (user.municipalityId !== targetMunicipalityId) {
      throw new MunicipalityScopeError(
        targetMunicipalityId,
        user.municipalityId
      );
    }
  }
}

/**
 * Returns the Prisma query filter to automatically scope queries by municipality.
 *
 * - If headquarter user (`isHeadquarter: true`): Returns empty object `{}` -> full visibility of all 13 municipalities.
 * - If sub-municipality user (`isHeadquarter: false`): Returns `{ municipalityId: user.municipalityId }` -> strictly isolated.
 */
export function getMunicipalityScope(user: SessionUser): { municipalityId?: string } {
  if (user.isHeadquarter) {
    return {};
  }
  return { municipalityId: user.municipalityId };
}

