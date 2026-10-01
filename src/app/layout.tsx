import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LivrablesProvider } from "@/context/LivrablesContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PNPE Com-Ops | Plateforme de pilotage Cellule Communication",
  description: "Système complet de gestion opérationnelle et éditoriale de la Cellule Communication du PNPE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="flex h-screen overflow-hidden bg-background">
        <LivrablesProvider>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50/50">
              {children}
            </main>
          </div>
        </LivrablesProvider>
      </body>
    </html>
  );
}
