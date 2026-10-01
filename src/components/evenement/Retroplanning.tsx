"use client";

import { CalendarRange, CheckCircle, Clock, Search } from 'lucide-react';
import { ProjetEvenement } from '@/types/com-ops';
import { useLivrables } from '@/context/LivrablesContext';

export function Retroplanning({ projet }: { projet: ProjetEvenement }) {
  const { livrables: contextLivrables } = useLivrables();
  
  // Récupérer tous les livrables associés au projet via le champ projetId, ou via les lots
  const livrables = contextLivrables.filter(l => l.projetId === projet.id || projet.lotsTravail.flatMap(lot => lot.livrablesId).includes(l.id))
    .sort((a, b) => new Date(a.dateCible).getTime() - new Date(b.dateCible).getTime());

  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm flex flex-col h-[400px]">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-pnpe-blue uppercase tracking-wider flex items-center gap-2">
          <CalendarRange size={16} className="text-gray-400" />
          Rétroplanning Actif
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Filtrer..." className="text-xs pl-7 pr-2 py-1 hairline-border rounded focus:outline-none focus:ring-1 focus:ring-pnpe-green" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider hairline-border-b">
              <th className="pb-3 font-medium w-1/4">Livrable</th>
              <th className="pb-3 font-medium">Format</th>
              <th className="pb-3 font-medium">Assigné</th>
              <th className="pb-3 font-medium">Date cible</th>
              <th className="pb-3 font-medium text-right">Statut / BAT</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {livrables.map(livrable => (
              <tr key={livrable.id} className="hairline-border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <span className="font-medium text-pnpe-blue line-clamp-1">{livrable.titre}</span>
                </td>
                <td className="py-3 text-gray-600 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded">{livrable.format}</span>
                </td>
                <td className="py-3 text-gray-600 text-xs">
                  {livrable.assigneA || 'Non assigné'}
                </td>
                <td className="py-3 text-gray-600 text-xs font-medium">
                  {new Date(livrable.dateCible).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </td>
                <td className="py-3 text-right">
                  {livrable.statut === 'publie' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-pnpe-green bg-pnpe-green/10 px-2 py-1 rounded-md">
                      <CheckCircle size={14} /> Publié
                    </span>
                  ) : livrable.statut === 'en_validation' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-pnpe-amber bg-pnpe-amber/10 px-2 py-1 rounded-md">
                      <Clock size={14} /> BAT en attente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md capitalize">
                      {livrable.statut.replace('_', ' ')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {livrables.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-gray-500">Aucun livrable planifié.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
