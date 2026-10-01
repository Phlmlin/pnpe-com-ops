"use client";

import { useState } from 'react';
import { X, Calendar as CalendarIcon, MapPin, Target } from 'lucide-react';
import { useLivrables } from '@/context/LivrablesContext';

interface NewProjetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjetDrawer({ isOpen, onClose }: NewProjetDrawerProps) {
  const { addProjet } = useLivrables();
  
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [lieu, setLieu] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [budget, setBudget] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !dateDebut || !dateFin) return;
    
    addProjet({
      nom,
      description,
      lieu,
      dateDebut: new Date(dateDebut).toISOString(),
      dateFin: new Date(dateFin).toISOString(),
      budget: budget ? parseInt(budget) : undefined
    });
    
    // Reset et fermeture
    setNom('');
    setDescription('');
    setLieu('');
    setDateDebut('');
    setDateFin('');
    setBudget('');
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-pnpe-blue/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
        
        <div className="flex items-center justify-between p-6 hairline-border-b bg-gray-50/80">
          <div>
            <h2 className="text-lg font-bold text-pnpe-blue flex items-center gap-2">
              <Target size={18} className="text-pnpe-green" />
              Nouvel Événement
            </h2>
            <p className="text-xs text-gray-500">Ajouter un nouveau projet ou événement</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-pnpe-blue hover:bg-white rounded-full transition-colors hairline-border"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de l'événement <span className="text-red-500">*</span></label>
              <input 
                required
                value={nom}
                onChange={e => setNom(e.target.value)}
                type="text" 
                placeholder="Ex: Caravane de l'Emploi 2026"
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Objectif</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Décrivez brièvement le projet..."
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green resize-none"
              ></textarea>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <CalendarIcon size={14} /> Date de début <span className="text-red-500">*</span>
                </label>
                <input 
                  required
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                  type="date" 
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <CalendarIcon size={14} /> Date de fin <span className="text-red-500">*</span>
                </label>
                <input 
                  required
                  value={dateFin}
                  onChange={e => setDateFin(e.target.value)}
                  type="date" 
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
                />
              </div>
            </div>

            {/* Lieu et Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={14} /> Lieu
                </label>
                <input 
                  value={lieu}
                  onChange={e => setLieu(e.target.value)}
                  type="text" 
                  placeholder="Ex: Libreville, Gabon"
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Budget Alloué
                </label>
                <input 
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  type="number" 
                  placeholder="Ex: 5000000"
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
                />
              </div>
            </div>

          </div>

          <div className="p-4 hairline-border-t bg-gray-50 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hairline-border rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-pnpe-green rounded-md hover:bg-pnpe-green-light transition-colors shadow-sm"
            >
              Créer l'événement
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
