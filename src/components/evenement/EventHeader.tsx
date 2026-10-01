"use client";

import { Calendar, MapPin, User, Timer } from 'lucide-react';
import { ProjetEvenement, Utilisateur } from '@/types/com-ops';
import { useLivrables } from '@/context/LivrablesContext';

interface EventHeaderProps {
  projet: ProjetEvenement;
}

export function EventHeader({ projet }: EventHeaderProps) {
  const { utilisateurs, livrables } = useLivrables();
  const chefDeProjet = utilisateurs.find(u => u.id === projet.chefDeProjetId);

  // Calcul dynamique de l'avancement
  const eventLivrables = livrables.filter(l => l.projetId === projet.id || projet.lotsTravail.flatMap(lot => lot.livrablesId).includes(l.id));
  const nbLivrables = eventLivrables.length;
  const livrablesTermines = eventLivrables.filter(l => l.statut === 'publie').length;
  const calculatedProgress = nbLivrables > 0 ? Math.round((livrablesTermines / nbLivrables) * 100) : 0;
  // Fallback to static progress if no deliverables yet
  const displayProgress = nbLivrables > 0 ? calculatedProgress : projet.jaugeAvancement;

  // Calcul des jours restants
  const daysDiff = Math.ceil((new Date(projet.dateDebut).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const countdownText = daysDiff > 0 ? `J-${daysDiff} (Compte à rebours)` : (daysDiff === 0 ? "Jour J !" : `Terminé depuis ${Math.abs(daysDiff)} j`);

  return (
    <div className="bg-white p-6 rounded-lg hairline-border shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold bg-pnpe-blue/10 text-pnpe-blue px-2 py-1 rounded-sm uppercase tracking-wider">
            Événement Majeur
          </span>
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Timer size={14} className="text-pnpe-amber" />
            {countdownText}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-pnpe-dark mb-2">{projet.nom}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> {new Date(projet.dateDebut).toLocaleDateString('fr-FR')} - {new Date(projet.dateFin).toLocaleDateString('fr-FR')}</span>
          <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {projet.lieu}</span>
          <span className="flex items-center gap-1.5"><User size={16} className="text-gray-400" /> Chef de projet : <span className="font-medium text-pnpe-dark">{chefDeProjet?.prenom} {chefDeProjet?.nom}</span></span>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 w-full md:w-64">
        <div className="bg-gray-50 p-4 rounded-md hairline-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avancement Global</span>
            <span className="text-sm font-bold text-pnpe-dark">{displayProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-pnpe-blue h-2 rounded-full transition-all duration-500" style={{ width: `${displayProgress}%` }}></div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 bg-white hover:bg-gray-50 text-pnpe-dark border border-gray-200 text-xs font-bold py-2 rounded transition-colors">
            Éditer
          </button>
          <button className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-gray-200 text-xs font-bold py-2 rounded transition-colors">
            Archiver
          </button>
        </div>
      </div>
    </div>
  );
}
