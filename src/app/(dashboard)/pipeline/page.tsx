"use client";

import { useLivrables } from '@/context/LivrablesContext';
import { KanbanSquare, Filter, MoreHorizontal, User, Clock } from 'lucide-react';
import { StatutLivrable } from '@/types/com-ops';

export default function PipelinePage() {
  const { livrables, updateLivrableStatus, utilisateurs } = useLivrables();
  
  const getUserName = (id?: string) => {
    if (!id) return 'Non assigné';
    const user = utilisateurs.find(u => u.id === id);
    return user ? user.prenom : 'Inconnu';
  };

  const colonnes: { id: StatutLivrable, label: string, color: string }[] = [
    { id: 'brief', label: 'Brief / Idée', color: 'bg-gray-200 text-gray-700' },
    { id: 'conception', label: 'En création', color: 'bg-blue-100 text-blue-700' },
    { id: 'en_validation', label: 'En révision (BAT)', color: 'bg-pnpe-amber/20 text-yellow-800' },
    { id: 'programme', label: 'Prêt / Programmé', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'publie', label: 'Publié / Archivé', color: 'bg-pnpe-blue text-white' }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-dark tracking-tight flex items-center gap-2">
            <KanbanSquare size={24} className="text-pnpe-amber" />
            Pipeline de Production
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-white hairline-border px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Événement
          </button>
          <button className="bg-white hairline-border px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Responsable
          </button>
        </div>
      </div>

      {/* Colonnes Kanban */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {colonnes.map(colonne => {
          const items = livrables.filter(l => l.statut === colonne.id);

          const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
          };

          const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            const livrableId = e.dataTransfer.getData('livrableId');
            if (livrableId) {
              updateLivrableStatus(livrableId, colonne.id);
            }
          };

          return (
            <div 
              key={colonne.id} 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex-shrink-0 w-80 flex flex-col bg-gray-100/50 rounded-lg hairline-border"
            >
              {/* En-tête de colonne */}
              <div className="p-3 hairline-border-b flex justify-between items-center bg-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colonne.color.split(' ')[0]}`}></span>
                  <h3 className="text-sm font-bold text-pnpe-dark">{colonne.label}</h3>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full transition-all">
                  {items.length}
                </span>
              </div>

              {/* Cartes */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {items.map(livrable => (
                  <div 
                    key={livrable.id} 
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('livrableId', livrable.id);
                    }}
                    className="bg-white p-3 rounded-md hairline-border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-gray-100 text-gray-600">
                        {livrable.format}
                      </span>
                      <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-pnpe-dark mb-1 leading-tight">{livrable.titre}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{livrable.brief}</p>
                    
                    <div className="flex justify-between items-center mt-auto pt-3 hairline-border-t">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User size={12} />
                        <span className="truncate max-w-[80px]">{getUserName(livrable.assigneA)}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${new Date(livrable.dateCible).getTime() < new Date().getTime() && livrable.statut !== 'publie' ? 'bg-red-100 text-red-700' : 'text-gray-400'}`}>
                        <Clock size={10} />
                        {new Date(livrable.dateCible).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-center p-3 text-gray-400">
                    <span className="text-sm font-medium mb-1">Aucun livrable</span>
                    <span className="text-xs">Glissez-déposez ici</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
