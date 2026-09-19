import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getInvoicesAction } from "@/actions/finance";
import { getMunicipalitiesForGIS } from "@/actions/parcels";
import { FinanceClientView } from "@/components/finance/finance-client-view";

export const metadata = {
  title: "دارایی، داهات و پسوولەی فەرمی | شارەوانییەکانی گەرمیان",
  description: "سیستەمی ئەلیکترۆنی داهات، کرێ، ڕسومات و چاپکردنی پسوولەی شارەوانی",
};

export default async function FinanceDashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const {
    invoices,
    totalCollectedFormatted,
    paidCount,
    pendingCount,
  } = await getInvoicesAction();

  const rawMunicipalities = await getMunicipalitiesForGIS();
  const municipalities = rawMunicipalities.map((m) => ({
    id: m.id,
    nameKrd: m.nameKrd,
    isHeadquarter: m.isHeadquarter,
  }));

  return (
    <FinanceClientView
      initialInvoices={invoices}
      totalCollectedFormatted={totalCollectedFormatted}
      paidCount={paidCount}
      pendingCount={pendingCount}
      municipalities={municipalities}
      userMunicipalityId={user.municipalityId}
    />
  );
}

