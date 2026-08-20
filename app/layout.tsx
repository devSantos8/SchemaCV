import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google";
import "./globals.css";
import { SupabaseSyncProvider } from "@/components/providers/SupabaseSyncProvider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SchemaCV — Plataforma de CVs Optimizados para ATS con Sincronización YAML",
  description:
    "Crea, personaliza y exporta currículums profesionales de ingeniería y tecnología optimizados para Applicant Tracking Systems (ATS) con editor dual visual y YAML, taxonomía de habilidades y exportación a PDF y Word DOCX.",
  keywords: [
    "ATS Resume",
    "Currículum ATS",
    "YAML Resume",
    "DevOps CV",
    "Full Stack CV",
    "Software Engineer Resume",
    "Exportar DOCX ATS",
    "SchemaCV",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SupabaseSyncProvider>{children}</SupabaseSyncProvider>
      </body>
    </html>
  );
}
