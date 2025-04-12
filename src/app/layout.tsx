import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ContainerProvider } from "@/shared/container/ContainerProvider";
import { AuthStatus } from "@/components/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClimaEdu - Learning Content Management Portal",
  description: "Complete digital education platform for managing educational content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ContainerProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-white dark:bg-gray-900 border-t py-6">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} ClimaEdu. All rights reserved.
            </div>
          </footer>
        </ContainerProvider>
      </body>
    </html>
  );
}
