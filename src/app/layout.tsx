import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ContainerProvider } from "@/shared/container/ContainerProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ToastProvider } from "@/components/toast";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { HostInstitutionProvider } from "@/components/institution/HostInstitutionProvider";
import { InstitutionNotFound } from "@/components/institution/InstitutionNotFound";
import { getHostContext, type HostInstitution } from "@/_core/modules/institution/infrastructure/server/host-institution";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "ClimaEdu - Learning Content Management Portal";
const DEFAULT_DESCRIPTION = "Complete digital education platform for managing educational content";

export async function generateMetadata(): Promise<Metadata> {
  const { domain, institution } = await getHostContext();

  if (institution) {
    return { title: institution.name, description: institution.name };
  }

  if (domain) {
    return { title: "Instituição não encontrada" };
  }

  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
}

/** Same CSS variables applied by useThemeColors, rendered on the server to avoid a color flash */
function getThemeStyle(institution: HostInstitution | null): CSSProperties | undefined {
  if (!institution?.primaryColor || !institution.secondaryColor) return undefined;

  return {
    '--primary': institution.primaryColor,
    '--primary-foreground': institution.secondaryColor,
    '--secondary': institution.secondaryColor,
    '--secondary-foreground': institution.secondaryColor,
    '--sidebar-primary': institution.primaryColor,
    '--sidebar-primary-foreground': institution.secondaryColor,
  } as CSSProperties;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { domain, institution } = await getHostContext();

  return (
    <html lang="pt-br" style={getThemeStyle(institution)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {domain && !institution ? (
          <InstitutionNotFound domain={domain} />
        ) : (
          <HostInstitutionProvider institution={institution}>
            <ContainerProvider>
              <ThemeProvider>
                <AuthGuard>
                  <ToastProvider>
                    <main className="min-h-screen">
                      {children}
                    </main>
                    <footer className="bg-white dark:bg-gray-900 border-t py-6">
                      <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} {institution?.name ?? 'ClimaEdu'}. All rights reserved.
                      </div>
                    </footer>
                  </ToastProvider>
                </AuthGuard>
              </ThemeProvider>
            </ContainerProvider>
          </HostInstitutionProvider>
        )}
        <SpeedInsights />
      </body>
    </html>
  );
}
