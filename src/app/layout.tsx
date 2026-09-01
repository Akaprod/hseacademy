import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IICP - Institut International des Compétences Professionnelles QHSE",
  description: "L'IICP propose des formations professionnelles diplômantes en Qualité, Hygiène, Sécurité et Environnement. Licence, Master, Technicien QHSE. Contact : +212 6 75 147100",
  keywords: ["QHSE", "formation QHSE", "ISO 9001", "ISO 14001", "ISO 45001", "management qualité", "sécurité au travail", "environnement", "IICP", "institut QHSE"],
  authors: [{ name: "IICP - Institut International des Compétences Professionnelles" }],
  openGraph: {
    title: "IICP - Formations QHSE Diplômantes",
    description: "Formations professionnelles en Qualité, Hygiène, Sécurité et Environnement",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}