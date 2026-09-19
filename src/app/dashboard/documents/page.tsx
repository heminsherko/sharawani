import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDocumentsAction } from "@/actions/documents";
import { getMunicipalitiesForGIS } from "@/actions/parcels";
import { EDMSClientView } from "@/components/edms/edms-client-view";

export const metadata = {
  title: "نوسراوە ئەلیکترۆنییەکان EDMS | بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان",
  description: "سیستەمی گواستنەوە و پەڕاوی ئەلیکترۆنی لەنێوان شارەوانییەکانی گەرمیان",
};

export default async function DocumentsDashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const documents = await getDocumentsAction();
  const rawMunicipalities = await getMunicipalitiesForGIS();

  const municipalities = rawMunicipalities.map((m) => ({
    id: m.id,
    nameKrd: m.nameKrd,
    isHeadquarter: m.isHeadquarter,
  }));

  return (
    <EDMSClientView
      initialDocuments={documents}
      municipalities={municipalities}
      userMunicipalityId={user.municipalityId}
    />
  );
}

