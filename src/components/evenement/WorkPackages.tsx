"use client";

import { Layers, FileText, Settings2, Plus, X } from 'lucide-react';
import { ProjetEvenement } from '@/types/com-ops';
import { useLivrables } from '@/context/LivrablesContext';
import { useState } from 'react';

export function WorkPackages({ projet }: { projet: ProjetEvenement }) {
  const { livrables, addLotToProjet, openDrawer } = useLivrables();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom) return;
    addLotToProjet(projet.id, {
      id: Math.random().toString(36).substr(2, 9),
      nom,
      description,
      livrablesId: []
    });
    setNom('');
    setDescription('');
    setIsModalOpen(false);
  };
  
  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm flex flex-col h-full relative">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-pnpe-dark uppercase tracking-wider flex items-center gap-2">
          <Layers size={16} className="text-gray-400" />
          Lots de Travail
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 bg-pnpe-blue hover:bg-pnpe-blue-hover text-white text-xs font-bold py-1 px-2 rounded transition-colors"
          >
            <Plus size={14} /> Créer
          </button>
          <button className="text-gray-400 hover:text-pnpe-dark transition-colors">
            <Settings2 size={16} />
          </button>
        </div>
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
              <div key={lot.id} className="hairline-border rounded-lg p-4 hover:shadow-sm transition-shadow group cursor-pointer border-l-4 border-l-pnpe-blue">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-pnpe-dark group-hover:text-pnpe-blue transition-colors">Lot {idx + 1} : {lot.nom}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{progress}%</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(projet.id, lot.id);
                      }}
                      className="text-gray-400 hover:text-pnpe-blue p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Ajouter un livrable à ce lot"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
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

      {isModalOpen && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center p-4 rounded-lg animate-in fade-in">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-xl rounded-lg p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-pnpe-dark text-sm">Nouveau Lot de Travail</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du lot</label>
                <input 
                  type="text" 
                  value={nom} 
                  onChange={e => setNom(e.target.value)} 
                  required
                  placeholder="Ex: Phase 1 - Digitale" 
                  className="w-full text-sm p-2 border border-gray-200 rounded focus:outline-none focus:border-pnpe-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (optionnel)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={2}
                  className="w-full text-sm p-2 border border-gray-200 rounded focus:outline-none focus:border-pnpe-blue resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-pnpe-blue hover:bg-pnpe-blue-light text-white font-bold py-2 rounded text-sm transition-colors">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
