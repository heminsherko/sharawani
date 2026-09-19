import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDashboardData } from "@/actions/dashboard";
import { DashboardViewWrapper } from "@/components/dashboard/dashboard-view-wrapper";

export const metadata = {
  title: "داشبۆردی سەرپەرشتیاری | Odoo Enterprise Gov ERP",
  description: "سیستەمی فەرمی و یەکگرتووی چاودێری و بەڕێوەبردنی شارەوانییەکانی گەرمیان",
};

export default async function DashboardMainPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const {
    metrics,
    revenueComparison,
    recentProjects,
    municipalitiesMatrix,
    pendingDocumentQueue,
  } = await getDashboardData();

  return (
    <DashboardViewWrapper
      metrics={metrics}
      revenueComparison={revenueComparison}
      recentProjects={recentProjects}
      municipalitiesMatrix={municipalitiesMatrix}
      pendingDocumentQueue={pendingDocumentQueue}
      userFullName={user.fullName}
      municipalityName={user.municipalityNameKrd}
    />
  );
}
