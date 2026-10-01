"use client";

import { useLivrables } from '@/context/LivrablesContext';
import { Send, Clock, Image as ImageIcon } from 'lucide-react';

export function TodaysRoll() {
  const { livrables, updateLivrableStatus } = useLivrables();
  
  // Simuler les livrables du jour
  const todayLivrables = livrables.filter(l => 
    l.statut === 'programme' || l.statut === 'publie'
  ).sort((a, b) => new Date(a.dateCible).getTime() - new Date(b.dateCible).getTime());

  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50">
        <h2 className="text-sm font-semibold text-pnpe-blue uppercase tracking-wider">À publier aujourd'hui</h2>
        <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{todayLivrables.length} actions</span>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="relative">
          {/* Ligne verticale de la timeline */}
          {todayLivrables.length > 0 && (
            <div className="absolute top-0 bottom-0 left-[23px] w-px bg-gray-200 z-0"></div>
          )}

          <div className="space-y-6 relative z-10">
            {todayLivrables.map((livrable, idx) => (
              <div key={livrable.id} className="flex gap-4 group">
                
                {/* Colonne heure et point */}
                <div className="flex flex-col items-center pt-1 min-w-[50px] bg-white">
                  <span className="text-[10px] font-bold text-gray-500 mb-1">
                    {new Date(livrable.dateCible).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`w-3 h-3 rounded-full border-2 bg-white ${livrable.statut === 'publie' ? 'border-pnpe-green' : 'border-pnpe-blue group-hover:scale-125 transition-transform'}`}></div>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-lg p-3 group-hover:border-pnpe-blue/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                        livrable.canal === 'LinkedIn' ? 'bg-blue-100 text-blue-700' :
                        livrable.canal === 'Facebook' ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {livrable.canal}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{livrable.format}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-pnpe-blue leading-tight mb-1">{livrable.titre}</h4>
                  
                  <div className="mt-3 flex items-center justify-end">
                    {livrable.statut === 'publie' ? (
                      <span className="text-xs font-bold text-pnpe-green flex items-center gap-1">
                        <Clock size={12} />
                        Déjà publié
                      </span>
                    ) : (
                      <button 
                        onClick={() => updateLivrableStatus(livrable.id, 'publie')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-pnpe-blue text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-pnpe-blue-light"
                      >
                        <Send size={12} />
                        Marquer Publié
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {todayLivrables.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Aucune publication prévue aujourd'hui</p>
          </div>
        )}
      </div>
    </div>
  );
}
