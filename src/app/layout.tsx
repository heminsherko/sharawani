import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { getSession } from "@/lib/auth/session";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-kufi",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "سیستەمی بەڕێوەبردنی شارەوانییەکانی گەرمیان | Odoo Enterprise ERP",
  description:
    "سیستەمی یەکگرتووی بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان و ١٣ شارەوانی سەر بە ئیدارەی سەربەخۆی گەرمیان",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html
      lang="ckb"
      dir="rtl"
      suppressHydrationWarning
      className={`${notoKufiArabic.variable} ${notoKufiArabic.className}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${notoKufiArabic.className} antialiased min-h-screen bg-background text-foreground flex flex-col selection:bg-[#017E84]/30`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper
            currentUser={
              user
                ? {
                    fullName: user.fullName,
                    phone: user.phone,
                    role: user.role,
                    municipalityNameKrd: user.municipalityNameKrd,
                    isHeadquarter: user.isHeadquarter,
                  }
                : undefined
            }
          >
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
