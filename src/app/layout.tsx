import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
