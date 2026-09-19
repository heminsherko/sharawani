import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginPage from "@/app/login/page";

export const metadata = {
  title: "چوونەژوورەوەی فەرمی | سیستەمی یەکگرتووی شارەوانییەکانی گەرمیان",
  description: "سیستەمی فەرمی و ناوخۆیی بەڕێوەبردنی شارەوانییەکانی گەرمیان (ERP)",
};

export default async function RootPage() {
  const session = await getSession();

  // If already authenticated with government credentials, transition directly into ERP
  if (session) {
    redirect("/dashboard");
  }

  // Pure internal government system: immediately render the formal enterprise sign-in
  return <LoginPage />;
}