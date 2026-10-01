"use client";

import { Calendar, MapPin, User, Timer } from 'lucide-react';
import { ProjetEvenement, Utilisateur } from '@/types/com-ops';
import { useLivrables } from '@/context/LivrablesContext';

interface EventHeaderProps {
  projet: ProjetEvenement;
}

export function EventHeader({ projet }: EventHeaderProps) {
  const { utilisateurs } = useLivrables();
  const chefDeProjet = utilisateurs.find(u => u.id === projet.chefDeProjetId);

  return (
    <div className="bg-white p-6 rounded-lg hairline-border shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold bg-pnpe-green/10 text-pnpe-green px-2 py-1 rounded-sm uppercase tracking-wider">
            Événement Majeur
          </span>
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Timer size={14} className="text-pnpe-amber" />
            J-45 (Compte à rebours)
          </span>
        </div>
        <h1 className="text-2xl font-bold text-pnpe-blue mb-2">{projet.nom}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> {new Date(projet.dateDebut).toLocaleDateString('fr-FR')} - {new Date(projet.dateFin).toLocaleDateString('fr-FR')}</span>
          <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {projet.lieu}</span>
          <span className="flex items-center gap-1.5"><User size={16} className="text-gray-400" /> Chef de projet : <span className="font-medium text-pnpe-blue">{chefDeProjet?.prenom} {chefDeProjet?.nom}</span></span>
        </div>
      </div>
      
      <div className="w-full md:w-64 bg-gray-50 p-4 rounded-md hairline-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avancement Global</span>
          <span className="text-sm font-bold text-pnpe-blue">{projet.jaugeAvancement}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-pnpe-green h-2 rounded-full" style={{ width: `${projet.jaugeAvancement}%` }}></div>
        </div>
      </div>
    </div>
  );
}
