"use client";

import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useLivrables } from '@/context/LivrablesContext';
import { logout } from '@/app/login/actions';

export function Header() {
  const { currentUser, isLoading } = useLivrables();

  if (isLoading || !currentUser) return <header className="h-16 bg-white hairline-border-b flex items-center justify-between px-6 sticky top-0 z-10 glass-panel"></header>;

  return (
    <header className="h-16 bg-white hairline-border-b flex items-center justify-between px-6 sticky top-0 z-10 glass-panel">
      {/* Recherche */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher un projet, livrable, événement..." 
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue sm:text-sm transition-colors"
          />
        </div>
      </div>

      {/* Actions Droite */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-pnpe-dark transition-colors rounded-full hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-pnpe-amber ring-2 ring-white"></span>
        </button>
        
        {/* Paramètres */}
        <button className="p-2 text-gray-400 hover:text-pnpe-dark transition-colors rounded-full hover:bg-gray-100">
          <Settings size={20} />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Profil Utilisateur */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-medium text-pnpe-dark leading-tight">{currentUser.prenom} {currentUser.nom}</span>
            <span className="text-xs text-gray-500">{currentUser.role === 'admin_directeur' ? 'Super Admin' : currentUser.role}</span>
          </div>
          {currentUser.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt={`Avatar de ${currentUser.nom}`} 
              className="h-8 w-8 rounded-full border border-gray-200"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-pnpe-blue text-white flex items-center justify-center text-xs font-medium">
              {currentUser.prenom.charAt(0)}{currentUser.nom.charAt(0)}
            </div>
          )}
        </div>

        {/* Bouton de déconnexion */}
        <button 
          onClick={() => logout()}
          className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-md flex items-center gap-2"
          title="Se déconnecter"
        >
          <LogOut size={18} />
          <span className="sr-only">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
