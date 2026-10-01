"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  CalendarDays, 
  KanbanSquare, 
  CheckCircle, 
  Megaphone,
  Briefcase,
  FileText,
  MessageSquareShare,
  Image as ImageIcon,
  Newspaper,
  Plus,
  FolderOpen
} from 'lucide-react';
import { NewLivrableDrawer } from '@/components/NewLivrableDrawer';
import { NewProjetDrawer } from '@/components/NewProjetDrawer';
import { useLivrables } from '@/context/LivrablesContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Sidebar() {
  const { livrables, projets, isDrawerOpen, openDrawer, closeDrawer, isProjetDrawerOpen, openProjetDrawer, closeProjetDrawer } = useLivrables();
  
  const validationsCount = livrables.filter(l => l.statut === 'en_validation').length;

  // Icône dynamique selon le nom du projet (pour la démo)
  const getProjectIcon = (nom: string) => {
    if (nom.toLowerCase().includes('forum')) return <Megaphone size={18} className="text-gray-400" />;
    if (nom.toLowerCase().includes('caravane')) return <Briefcase size={18} className="text-gray-400" />;
    if (nom.toLowerCase().includes('mag')) return <FileText size={18} className="text-gray-400" />;
    return <FolderOpen size={18} className="text-gray-400" />;
  };

  return (
    <>
      <aside className="w-64 flex-shrink-0 hairline-border-r bg-white dark:bg-slate-900 h-screen flex flex-col sticky top-0 z-20 relative transition-colors">
        {/* Cartouche d'espace (Direction PNPE) */}
        <div className="p-4 hairline-border-b flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="relative h-10 w-32">
              <img src="/images/logo-light.png" alt="PNPE Logo" className="absolute inset-0 h-full object-contain dark:hidden" />
              <img src="/images/logo-dark.png" alt="PNPE Logo" className="absolute inset-0 h-full object-contain hidden dark:block" />
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-pnpe-blue dark:bg-pnpe-blue-light flex items-center justify-center text-white font-bold text-sm shadow-sm">
              PN
            </div>
            <div>
              <h1 className="font-semibold text-pnpe-blue dark:text-gray-100 text-sm leading-tight">PNPE Com-Ops</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Direction de la Communication</p>
            </div>
          </div>
        </div>

        {/* Bouton action rapide */}
        <div className="p-4">
          <button 
            onClick={openDrawer}
            className="w-full flex items-center justify-center gap-2 bg-pnpe-green hover:bg-pnpe-green-light text-white text-sm font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Nouveau Contenu</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6">
          
          {/* Section Pilotage */}
          <div>
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pilotage</h2>
            <nav className="space-y-0.5">
              <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors focus:bg-gray-50">
                <LayoutDashboard size={18} className="text-gray-400" />
                Dashboard
              </Link>
              <Link href="/calendrier" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors">
                <CalendarDays size={18} className="text-gray-400" />
                Calendrier éditorial
              </Link>
              <Link href="/pipeline" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors">
                <KanbanSquare size={18} className="text-gray-400" />
                Pipeline Kanban
              </Link>
              <Link href="/validation" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-gray-400" />
                  Sas de Validation
                </div>
                {validationsCount > 0 && (
                  <span className="bg-pnpe-amber text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {validationsCount}
                  </span>
                )}
              </Link>
              <Link href="/offres" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors">
                <Briefcase size={18} className="text-gray-400" />
                Offres d'emploi
              </Link>
            </nav>
          </div>

          {/* Section Événements Dynamiques */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Événements Actifs</h2>
              <button 
                onClick={openProjetDrawer}
                className="text-gray-400 hover:text-pnpe-green transition-colors bg-gray-50 hover:bg-pnpe-green/10 p-1 rounded" 
                title="Ajouter un événement"
              >
                <Plus size={14} />
              </button>
            </div>
            <nav className="space-y-0.5">
              {projets.map(projet => (
                <Link 
                  key={projet.id} 
                  href={`/evenements/${projet.id}`} 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors"
                >
                  {getProjectIcon(projet.nom)}
                  <span className="truncate">{projet.nom}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Section Canaux & Outils */}
          <div>
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Canaux & Outils</h2>
            <nav className="space-y-0.5">
              <Link href="/canaux/reseaux-sociaux" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors">
                <MessageSquareShare size={18} className="text-gray-400" />
                Réseaux Sociaux
              </Link>
              <Link href="/canaux/presse" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors">
                <Newspaper size={18} className="text-gray-400" />
                Print / Presse
              </Link>
              <Link href="/outils/mediatheque" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-blue hover:bg-gray-50 rounded-md transition-colors">
                <ImageIcon size={18} className="text-gray-400" />
                Médiathèque / Assets
              </Link>
            </nav>
          </div>

        </div>
        
        {/* Footer Sidebar (Optional settings/help) */}
        <div className="p-4 hairline-border-t">
          <div className="text-xs text-gray-400 flex justify-between items-center">
            <span>v1.0.0-beta</span>
            <span className="hover:text-pnpe-blue cursor-pointer">Aide</span>
          </div>
        </div>
      </aside>

      <NewLivrableDrawer 
        isOpen={isDrawerOpen} 
        onClose={closeDrawer} 
      />
      <NewProjetDrawer
        isOpen={isProjetDrawerOpen}
        onClose={closeProjetDrawer}
      />
    </>
  );
}
