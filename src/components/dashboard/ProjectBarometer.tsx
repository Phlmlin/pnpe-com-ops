"use client";

import { useLivrables } from '@/context/LivrablesContext';
import { Target, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Livrable } from '@/types/com-ops';

export function ProjectBarometer() {
  const { projets, livrables } = useLivrables();
  const mainProject = projets.length > 0 ? projets[0] : null;

  if (!mainProject) return null;

  // Calcul dynamique de l'avancement global
  const projectLivrables = livrables.filter(l => l.projetId === mainProject.id || mainProject.lotsTravail.flatMap(lot => lot.livrablesId).includes(l.id));
  const nbLivrables = projectLivrables.length;
  const livrablesTermines = projectLivrables.filter(l => l.statut === 'publie').length;
  const calculatedProgress = nbLivrables > 0 ? Math.round((livrablesTermines / nbLivrables) * 100) : 0;
  
  // Categorize livrables
  const graphismeLivs = projectLivrables.filter(l => ['Flyer', 'Carrousel', 'Bâche', 'Offre'].includes(l.format));
  const redactionLivs = projectLivrables.filter(l => l.format === 'Communiqué');
  const videoLivs = projectLivrables.filter(l => l.format === 'Vidéo');

  const getProgress = (livs: Livrable[]) => {
    if (livs.length === 0) return null;
    const completed = livs.filter(l => l.statut === 'publie').length;
    return Math.round((completed / livs.length) * 100);
  };

  const graphismeProgress = getProgress(graphismeLivs);
  const redactionProgress = getProgress(redactionLivs);
  const videoProgress = getProgress(videoLivs);

  const getBarColor = (progress: number | null) => {
    if (progress === null) return 'bg-gray-200';
    if (progress === 100) return 'bg-pnpe-blue';
    if (progress >= 50) return 'bg-pnpe-amber';
    return 'bg-blue-500';
  };

  const getTextColor = (progress: number | null) => {
    if (progress === null) return 'text-gray-400';
    if (progress === 100) return 'text-pnpe-blue';
    if (progress >= 50) return 'text-pnpe-amber';
    return 'text-blue-500';
  };

  const renderJauge = (titre: string, progress: number | null) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{titre}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className={`${getBarColor(progress)} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progress ?? 0}%` }}></div>
        </div>
        {progress === null ? (
          <span className="text-xs font-bold text-gray-400 w-8 text-right">N/A</span>
        ) : progress === 100 ? (
          <div className="flex items-center gap-1 w-8 justify-end">
            <CheckCircle2 size={14} className="text-pnpe-blue" />
          </div>
        ) : (
          <span className={`text-xs font-bold ${getTextColor(progress)} w-8 text-right`}>{progress}%</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm flex flex-col">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-pnpe-dark uppercase tracking-wider flex items-center gap-2">
          <Target size={16} className="text-pnpe-amber" />
          Projet Phare
        </h2>
        <span className="text-xs font-bold text-pnpe-dark bg-blue-50 px-2 py-1 rounded">
          {calculatedProgress}%
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-pnpe-dark text-lg leading-tight mb-1">{mainProject.nom}</h3>
        <p className="text-xs text-gray-500 mb-4">{mainProject.lieu}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
          <div 
            className="bg-pnpe-blue h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${calculatedProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-medium mb-5 uppercase tracking-wider">
          <span>Lancement Préparatifs</span>
          <span>Jour J</span>
        </div>

        {/* Charge d'équipe */}
        <div className="pt-4 hairline-border-t">
          <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            Progression de l'équipe Créative
          </h4>
          
          <div className="space-y-3">
            {renderJauge("Graphisme", graphismeProgress)}
            {renderJauge("Rédaction", redactionProgress)}
            {renderJauge("Vidéo", videoProgress)}
          </div>
        </div>
      </div>
    </div>
  );
}
