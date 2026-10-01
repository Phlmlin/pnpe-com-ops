"use client";

import { useLivrables } from '@/context/LivrablesContext';
import { Target, Users, AlertCircle } from 'lucide-react';

export function ProjectBarometer() {
  const { projets } = useLivrables();
  const mainProject = projets.length > 0 ? projets[0] : null;

  if (!mainProject) return null;

  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm flex flex-col">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-pnpe-blue uppercase tracking-wider flex items-center gap-2">
          <Target size={16} className="text-pnpe-amber" />
          Projet Phare
        </h2>
        <span className="text-xs font-bold text-pnpe-blue bg-blue-50 px-2 py-1 rounded">
          {mainProject.jaugeAvancement}%
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-pnpe-blue text-lg leading-tight mb-1">{mainProject.nom}</h3>
        <p className="text-xs text-gray-500 mb-4">{mainProject.lieu}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
          <div 
            className="bg-pnpe-green h-2.5 rounded-full" 
            style={{ width: `${mainProject.jaugeAvancement}%` }}
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
            Charge de l'équipe Créative
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Graphisme</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-pnpe-amber h-1.5 rounded-full w-4/5"></div>
                </div>
                <span className="text-xs font-bold text-pnpe-amber">80%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rédaction</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-pnpe-green h-1.5 rounded-full w-2/5"></div>
                </div>
                <span className="text-xs font-bold text-pnpe-green">40%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vidéo</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-red-500 h-1.5 rounded-full w-full"></div>
                </div>
                <AlertCircle size={14} className="text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
