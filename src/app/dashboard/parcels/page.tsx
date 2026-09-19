import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getParcelsAction, getMunicipalitiesForGIS } from "@/actions/parcels";
import { GISClientView } from "@/components/gis/gis-client-view";

export const metadata = {
  title: "بەڕێوەبردنی زەویوزار و کاداستری GIS | شارەوانییەکانی گەرمیان",
  description: "نەخشەی ئەلیکترۆنی جوگرافی زەویوزار و پارچەکانی ١٣ شارەوانی گەرمیان",
};

export default async function ParcelsDashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const { parcels, isHeadquarter } = await getParcelsAction();
  const municipalities = await getMunicipalitiesForGIS();

  return (
    <GISClientView
      initialParcels={parcels}
      municipalities={municipalities}
      userMunicipalityId={user.municipalityId}
      isHeadquarter={isHeadquarter}
    />
  );
}

