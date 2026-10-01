import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LivrablesProvider } from "@/context/LivrablesContext";
import { UIProvider } from "@/context/UIContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PNPE Com | Plateforme de pilotage Cellule Communication",
  description: "Système complet de gestion opérationnelle et éditoriale de la Cellule Communication du PNPE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="h-screen w-screen overflow-hidden bg-background">
        <UIProvider>
          <LivrablesProvider>
            {children}
          </LivrablesProvider>
        </UIProvider>
      </body>
    </html>
  );
}
