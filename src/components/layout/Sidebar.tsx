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
  FolderOpen,
  Users
} from 'lucide-react';
import { NewLivrableDrawer } from '@/components/NewLivrableDrawer';
import { NewProjetDrawer } from '@/components/NewProjetDrawer';
import { AddUserModal } from '@/components/AddUserModal';
import { useLivrables } from '@/context/LivrablesContext';
import { useUI } from '@/context/UIContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { livrables, projets, utilisateurs, currentUser, logout } = useLivrables();
  const { isDrawerOpen, openDrawer, closeDrawer, isProjetDrawerOpen, openProjetDrawer, closeProjetDrawer, openUserModal } = useUI();
  
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
            <div className="relative h-12 w-full flex justify-center">
              <img src="/logo-pnpe.png" alt="PNPE Logo Officiel" className="h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <h1 className="font-bold text-pnpe-dark dark:text-gray-100 text-sm leading-tight">PNPE Com</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cellule Communication</p>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Bouton action rapide */}
        <div className="p-4">
          <button 
            onClick={() => openDrawer()}
            className="w-full flex items-center justify-center gap-2 bg-pnpe-blue hover:bg-pnpe-blue-hover text-white text-sm font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
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
              <Link href="/" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/' ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <LayoutDashboard size={18} className={pathname === '/' ? 'text-pnpe-blue' : 'text-gray-400'} />
                Dashboard
              </Link>
              <Link href="/calendrier" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/calendrier') ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <CalendarDays size={18} className={pathname.startsWith('/calendrier') ? 'text-pnpe-blue' : 'text-gray-400'} />
                Calendrier éditorial
              </Link>
              <Link href="/pipeline" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/pipeline') ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <KanbanSquare size={18} className={pathname.startsWith('/pipeline') ? 'text-pnpe-blue' : 'text-gray-400'} />
                Pipeline Kanban
              </Link>
              <Link href="/validation" className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/validation') ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className={pathname.startsWith('/validation') ? 'text-pnpe-blue' : 'text-gray-400'} />
                  Sas de Validation
                </div>
                {validationsCount > 0 && (
                  <span className="bg-pnpe-amber text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {validationsCount}
                  </span>
                )}
              </Link>
              <Link href="/offres" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/offres') ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <Briefcase size={18} className={pathname.startsWith('/offres') ? 'text-pnpe-blue' : 'text-gray-400'} />
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
                className="text-gray-400 hover:text-pnpe-blue transition-colors bg-gray-50 hover:bg-pnpe-blue/10 p-1 rounded" 
                title="Ajouter un événement"
              >
                <Plus size={14} />
              </button>
            </div>
            <nav className="space-y-0.5">
              {projets.map(projet => {
                const isActive = pathname.startsWith(`/evenements/${projet.id}`);
                return (
                  <Link 
                    key={projet.id} 
                    href={`/evenements/${projet.id}`} 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}
                  >
                    {isActive ? 
                      (projet.nom.toLowerCase().includes('forum') ? <Megaphone size={18} className="text-pnpe-blue" /> : 
                       projet.nom.toLowerCase().includes('caravane') ? <Briefcase size={18} className="text-pnpe-blue" /> : 
                       projet.nom.toLowerCase().includes('mag') ? <FileText size={18} className="text-pnpe-blue" /> : 
                       <FolderOpen size={18} className="text-pnpe-blue" />) 
                      : getProjectIcon(projet.nom)}
                    <span className="truncate">{projet.nom}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section Canaux & Outils */}
          <div>
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Canaux & Outils</h2>
            <nav className="space-y-0.5">
              <Link href="/canaux/reseaux-sociaux" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/canaux/reseaux-sociaux') ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <MessageSquareShare size={18} className={pathname.startsWith('/canaux/reseaux-sociaux') ? 'text-pnpe-blue' : 'text-gray-400'} />
                Réseaux Sociaux
              </Link>
              <Link href="/canaux/presse" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/canaux/presse') ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <Newspaper size={18} className={pathname.startsWith('/canaux/presse') ? 'text-pnpe-blue' : 'text-gray-400'} />
                Print / Presse
              </Link>
              <Link href="/outils/mediatheque" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/outils/mediatheque') ? 'bg-pnpe-blue/10 text-pnpe-blue' : 'text-gray-600 hover:text-pnpe-dark hover:bg-gray-50'}`}>
                <ImageIcon size={18} className={pathname.startsWith('/outils/mediatheque') ? 'text-pnpe-blue' : 'text-gray-400'} />
                Médiathèque / Assets
              </Link>
            </nav>
          </div>

          {/* Section Équipe - Protégée */}
          {(currentUser?.role === 'admin_directeur' || currentUser?.role === 'Admin / Directeur' || currentUser?.email === 'greenmoundounga@gmail.com' || currentUser?.role === 'Chef de Service') && (
            <div>
              <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Équipe</h2>
              <nav className="space-y-0.5">
                <button 
                  onClick={openUserModal}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-pnpe-dark hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Users size={18} className="text-gray-400" />
                  <span className="flex-1 text-left">Collaborateurs</span>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{utilisateurs.length}</span>
                </button>
              </nav>
            </div>
          )}

        </div>
        
        {/* Footer Sidebar (Optional settings/help) */}
        <div className="p-4 hairline-border-t space-y-3">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-500 rounded-md transition-colors border border-red-100"
          >
            Déconnexion
          </button>
          <div className="text-xs text-gray-400 flex justify-between items-center">
            <span>v1.0.0-beta</span>
            <span className="hover:text-pnpe-dark cursor-pointer">Aide</span>
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
      <AddUserModal />
    </>
  );
}
