"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { assertPermission, getMunicipalityScope } from "@/lib/auth/rbac";
import { InvoiceStatus, UserRole } from "@prisma/client";

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  municipalityId: string;
  municipalityNameKrd: string;
  payerName: string;
  payerNationalId?: string | null;
  amount: number;
  amountFormatted: string;
  type: string;
  status: InvoiceStatus;
  paidAt: string | null;
  createdAt: string;
  amountInWords?: string;
}



/**
 * Generate a unique sequential invoice number (e.g. INV-2026-10482)
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let invoiceNumber = "";
  let exists = true;

  while (exists) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    invoiceNumber = `INV-${year}-${randomSuffix}`;
    const check = await prisma.revenueInvoice.findUnique({
      where: { invoiceNumber },
    });
    if (!check) exists = false;
  }

  return invoiceNumber;
}

/**
 * Fetch invoices scoped by user's municipality jurisdiction
 */
export async function getInvoicesAction(): Promise<{
  invoices: InvoiceDTO[];
  totalCollected: number;
  totalCollectedFormatted: string;
  paidCount: number;
  pendingCount: number;
}> {
  const user = await getSession();
  if (!user) {
    throw new Error("تکایە سەرەتا بچۆ ژوورەوە.");
  }

  const scope = getMunicipalityScope(user);

  const rawInvoices = await prisma.revenueInvoice.findMany({
    where: scope,
    include: {
      municipality: {
        select: { nameKrd: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let totalCollected = 0;
  let paidCount = 0;
  let pendingCount = 0;

  const invoices: InvoiceDTO[] = rawInvoices.map((inv) => {
    const num = Number(inv.amount);
    if (inv.status === "PAID") {
      totalCollected += num;
      paidCount++;
    } else {
      pendingCount++;
    }

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      municipalityId: inv.municipalityId,
      municipalityNameKrd: inv.municipality.nameKrd,
      payerName: inv.payerName,
      amount: num,
      amountFormatted: num.toLocaleString() + " دینار",
      type: inv.type,
      status: inv.status,
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
    };
  });

  return {
    invoices,
    totalCollected,
    totalCollectedFormatted: totalCollected.toLocaleString() + " دیناری عێراقی",
    paidCount,
    pendingCount,
  };
}

/**
 * Create and issue an official revenue collection invoice
 */
export async function createInvoiceAction(data: {
  municipalityId: string;
  payerName: string;
  payerNationalId?: string;
  amount: number;
  type: string;
  status?: InvoiceStatus;
}): Promise<{ success: boolean; invoiceNumber?: string; error?: string }> {
  try {
    const user = await getSession();
    if (!user) {
      throw new Error("تکایە سەرەتا بچۆ ژوورەوە.");
    }

    // RBAC validation: finance officers, engineers, mayors, DG can collect revenue
    assertPermission(
      user,
      [
        UserRole.FINANCE_OFFICER,
        UserRole.ENGINEER,
        UserRole.LAND_OFFICER,
        UserRole.MAYOR,
        UserRole.DIRECTOR_GENERAL,
      ],
      data.municipalityId
    );

    if (!data.payerName || !data.payerName.trim()) {
      return { success: false, error: "تکایە ناوی باجدەر یان هاوڵاتی بنووسە." };
    }

    if (!data.amount || data.amount <= 0) {
      return { success: false, error: "تکایە بڕی پارەی دروست دیاریبکە." };
    }

    const invoiceNumber = await generateInvoiceNumber();

    const newInvoice = await prisma.revenueInvoice.create({
      data: {
        invoiceNumber,
        municipalityId: data.municipalityId,
        payerName: data.payerName.trim(),
        amount: data.amount,
        type: data.type,
        status: data.status || InvoiceStatus.PAID,
        paidAt: (data.status || InvoiceStatus.PAID) === "PAID" ? new Date() : null,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "CREATE_REVENUE_INVOICE",
        entity: "RevenueInvoice",
        entityId: newInvoice.id,
        changesJson: {
          invoiceNumber: newInvoice.invoiceNumber,
          payer: newInvoice.payerName,
          amount: data.amount,
          type: data.type,
          municipalityId: data.municipalityId,
        },
      },
    });

    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard");
    return { success: true, invoiceNumber };
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return { success: false, error: error.message || "هەڵەیەک ڕوویدا لە دەرکردنی پسوولە." };
  }
}
