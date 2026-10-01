"use client";

import { useLivrables } from '@/context/LivrablesContext';
import { Check, Eye, MessageSquare } from 'lucide-react';

export function QuickApproval() {
  const { livrables, utilisateurs, updateLivrableStatus, currentUser } = useLivrables();
  const pendingLivrables = livrables.filter(l => l.statut === 'en_validation');

  const canValidate = currentUser?.droits?.pouvoirValidation === true;

  const getUserName = (id?: string) => {
    const user = utilisateurs.find(u => u.id === id);
    return user ? `${user.prenom} ${user.nom}` : 'Graphiste';
  };

  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-pnpe-blue text-white flex justify-between items-center">
        <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          Sas d'approbation
          {pendingLivrables.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-pnpe-amber animate-pulse"></span>
          )}
        </h2>
        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          {pendingLivrables.length} en attente
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-5 bg-gray-50/50">
        {pendingLivrables.map((livrable) => (
          <div key={livrable.id} className="relative group">
            {/* Effet d'empilement (feuilles en arrière-plan) */}
            <div className="absolute top-1 left-1 right-[-4px] bottom-[-4px] bg-white border border-gray-200 rounded-md"></div>
            
            <div className="relative bg-white border-l-4 border-l-pnpe-amber border-y border-r border-gray-200 rounded-md p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-pnpe-dark">{livrable.titre}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Proposé par <span className="font-medium text-gray-700">{getUserName(livrable.assigneA)}</span></p>
                </div>
                <span className="text-[10px] font-bold bg-pnpe-amber/10 text-yellow-800 border border-pnpe-amber/20 px-2 py-1 rounded">
                  BAT
                </span>
              </div>

              {/* Preview zone */}
              <div className="w-full h-24 bg-gray-100 rounded mb-3 flex flex-col items-center justify-center text-gray-400 cursor-pointer relative overflow-hidden border border-dashed border-gray-300 hover:border-pnpe-blue transition-colors">
                {livrable.piecesJointes && livrable.piecesJointes.length > 0 ? (
                  <img src={livrable.piecesJointes[0]} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Eye size={20} className="mb-1 opacity-50" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Aperçu {livrable.format}</span>
                  </>
                )}
              </div>

              {/* Actions - Seulement pour ceux qui ont le droit de validation */}
              {canValidate ? (
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => updateLivrableStatus(livrable.id, 'programme')}
                    className="flex-1 bg-pnpe-blue hover:bg-pnpe-blue-hover text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check size={14} />
                    Approuver
                  </button>
                  <button 
                    onClick={() => updateLivrableStatus(livrable.id, 'a_corriger')}
                    className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare size={14} />
                    Retouches
                  </button>
                </div>
              ) : (
                <div className="mt-4 bg-orange-50 border border-orange-100 rounded p-2 text-center text-xs text-orange-800 font-medium">
                  En attente de validation par la direction
                </div>
              )}
            </div>
          </div>
        ))}

        {pendingLivrables.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            Aucun contenu en attente de validation.
          </div>
        )}
      </div>
    </div>
  );
}
