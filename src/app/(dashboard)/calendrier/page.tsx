"use client";

import { useState } from 'react';
import { useLivrables } from '@/context/LivrablesContext';
import { useUI } from '@/context/UIContext';
import { Canal } from '@/types/com-ops';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Check } from 'lucide-react';

export default function CalendrierPage() {
  const { livrables } = useLivrables();
  const { openDrawer } = useUI();

  // Vue Mois / Semaine + filtre par canal (fonctionnels)
  const [view, setView] = useState<'mois' | 'semaine'>('mois');
  const [canalFilter, setCanalFilter] = useState<Canal | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Canaux réellement présents dans les livrables
  const canaux: Canal[] = Array.from(new Set(livrables.flatMap(l => l.canaux || [])));

  // Helpers de couleur selon le canal
  const getCanalColor = (canal: string) => {
    switch (canal) {
      case 'LinkedIn': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Facebook': return 'bg-blue-600 text-white border-blue-700';
      case 'TikTok': return 'bg-black text-white border-gray-800';
      case 'X': return 'bg-gray-800 text-white border-gray-900';
      case 'Presse': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Affichage': return 'bg-pnpe-amber/20 text-yellow-800 border-pnpe-amber/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  // Vue Mois : 14 jours simulés, vue Semaine : 7 jours
  const dates = Array.from({ length: view === 'mois' ? 14 : 7 }, (_, i) => i + 1);

  // Applique le filtre canal aux livrables d'un jour donné
  const itemsForDate = (date: number) =>
    livrables.filter(l => {
      if (new Date(l.dateCible).getDate() !== date) return false;
      if (canalFilter && !(l.canaux || []).includes(canalFilter)) return false;
      return true;
    });
  
  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-dark tracking-tight flex items-center gap-2">
            <CalendarIcon size={24} className="text-pnpe-blue" />
            Calendrier Éditorial
          </h1>
        </div>
        <div className="flex gap-3">
          {/* Filtre par canal (fonctionnel) */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(v => !v)}
              className={`bg-white hairline-border px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors ${canalFilter ? 'text-pnpe-blue border-pnpe-blue/40' : 'text-gray-600'}`}
            >
              <Filter size={16} /> {canalFilter ? `Canal : ${canalFilter}` : 'Filtrer par Canal'}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white hairline-border rounded-md shadow-lg z-30 py-1">
                <button
                  onClick={() => { setCanalFilter(null); setShowFilterMenu(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Tous les canaux
                  {!canalFilter && <Check size={14} className="text-pnpe-blue" />}
                </button>
                {canaux.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCanalFilter(c); setShowFilterMenu(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {c}
                    {canalFilter === c && <Check size={14} className="text-pnpe-blue" />}
                  </button>
                ))}
                {canaux.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400">Aucun canal pour le moment</p>
                )}
              </div>
            )}
          </div>
          {/* Bascule Mois / Semaine (fonctionnelle) */}
          <div className="bg-white hairline-border rounded-md flex items-center p-1">
            <button
              onClick={() => setView('mois')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${view === 'mois' ? 'font-bold bg-gray-100 text-pnpe-dark' : 'text-gray-500 hover:text-pnpe-dark'}`}
            >
              Mois
            </button>
            <button
              onClick={() => setView('semaine')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${view === 'semaine' ? 'font-bold bg-gray-100 text-pnpe-dark' : 'text-gray-500 hover:text-pnpe-dark'}`}
            >
              Semaine
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Calendrier */}
      <div className="bg-white rounded-t-lg hairline-border hairline-border-b-0 p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-pnpe-dark">Octobre 2026</h2>
        <div className="flex gap-2">
          <button className="p-1 hairline-border rounded hover:bg-gray-50"><ChevronLeft size={20} className="text-gray-600" /></button>
          <button className="p-1 hairline-border rounded hover:bg-gray-50"><ChevronRight size={20} className="text-gray-600" /></button>
        </div>
      </div>

      {/* Grille du calendrier (Simulation) */}
      <div className="bg-white rounded-b-lg hairline-border flex-1 grid grid-cols-7 grid-rows-[auto_1fr_1fr] overflow-hidden">
        {/* En-tête des jours */}
        {jours.map(j => (
          <div key={j} className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hairline-border-b hairline-border-r last:border-r-0 bg-gray-50/50">
            {j}
          </div>
        ))}

        {/* Cellules des jours */}
        {dates.map((date) => {
          const items = itemsForDate(date);
          
          return (
            <div 
              key={date} 
              className="min-h-[120px] p-2 hairline-border-b hairline-border-r [&:nth-child(7n)]:border-r-0 hover:bg-gray-50/50 cursor-pointer group transition-colors"
              onClick={() => openDrawer()}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-semibold block ${date === 5 ? 'text-pnpe-blue bg-pnpe-blue/10 w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-400'}`}>
                  {date}
                </span>
                <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium text-pnpe-blue">+ Ajouter</span>
                </span>
              </div>
              <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
                {items.map(l => (
                  <div key={l.id} className="space-y-1">
                    {l.canaux?.map(c => (
                      <div key={c} className={`text-[10px] font-medium px-2 py-1.5 rounded border leading-tight cursor-pointer hover:opacity-80 transition-opacity shadow-sm animate-in fade-in zoom-in duration-200 ${getCanalColor(c)}`}>
                        <div className="font-bold mb-0.5">{c}</div>
                        <div className="truncate opacity-90">{l.titre}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
