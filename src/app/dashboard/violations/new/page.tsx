import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getMunicipalitiesForGIS } from "@/actions/parcels";
import { FieldInspectorForm } from "@/components/violations/field-inspector-form";

export const metadata = {
  title: "تۆماری مەیدانی زیادەڕۆیی | چاودێری شارەوانی",
  description: "سیستەمی مەیدانی مۆبایلی چاودێری و تۆمارکردنی زیادەڕۆیی لە گەرمیان",
};

export default async function NewViolationPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const rawMunicipalities = await getMunicipalitiesForGIS();
  const municipalities = rawMunicipalities.map((m) => ({
    id: m.id,
    nameKrd: m.nameKrd,
    isHeadquarter: m.isHeadquarter,
  }));

  return (
    <div className="py-2">
      <FieldInspectorForm
        userMunicipalityId={user.municipalityId}
        userMunicipalityName={user.municipalityNameKrd}
        isHeadquarter={user.isHeadquarter}
        municipalities={municipalities}
        inspectorName={user.fullName}
      />
    </div>
  );
}

