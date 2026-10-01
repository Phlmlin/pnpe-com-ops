"use client";

import { Layers, FileText, Settings2 } from 'lucide-react';
import { ProjetEvenement } from '@/types/com-ops';
import { useLivrables } from '@/context/LivrablesContext';

export function WorkPackages({ projet }: { projet: ProjetEvenement }) {
  const { livrables } = useLivrables();
  
  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm flex flex-col h-full">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-pnpe-blue uppercase tracking-wider flex items-center gap-2">
          <Layers size={16} className="text-gray-400" />
          Lots de Travail
        </h2>
        <button className="text-gray-400 hover:text-pnpe-blue transition-colors">
          <Settings2 size={16} />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {projet.lotsTravail.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            Aucun lot de travail défini pour ce projet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projet.lotsTravail.map((lot, idx) => {
              const nbLivrables = lot.livrablesId.length;
              const livrablesTermines = lot.livrablesId.filter(id => livrables.find(l => l.id === id)?.statut === 'publie').length;
              const progress = nbLivrables > 0 ? Math.round((livrablesTermines / nbLivrables) * 100) : 0;

              return (
              <div key={lot.id} className="hairline-border rounded-lg p-4 hover:shadow-sm transition-shadow group cursor-pointer border-l-4 border-l-pnpe-green">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-pnpe-blue group-hover:text-pnpe-green transition-colors">Lot {idx + 1} : {lot.nom}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{progress}%</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{lot.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FileText size={14} />
                  <span>{nbLivrables} livrable{nbLivrables > 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
