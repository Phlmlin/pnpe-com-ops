"use client";

import { Users, Mail, Shield, Plus } from 'lucide-react';
import { ProjetEvenement } from '@/types/com-ops';
import { useLivrables } from '@/context/LivrablesContext';

export function EventPartners({ projet }: { projet: ProjetEvenement }) {
  const { utilisateurs } = useLivrables();
  const partenaires = utilisateurs.filter(u => projet.partenairesExternes.includes(u.id));

  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm h-full flex flex-col">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-pnpe-blue uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          Partenaires & Invités
        </h2>
        <button className="text-pnpe-green hover:bg-pnpe-green/10 p-1 rounded transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-4 bg-blue-50/50 border border-blue-100 p-3 rounded-md flex items-start gap-3">
          <Shield size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">Les invités externes ont un accès <strong>restreint en lecture/validation</strong> uniquement sur les lots de cet événement.</p>
        </div>

        <div className="space-y-3">
          {partenaires.map(partenaire => (
            <div key={partenaire.id} className="flex items-center justify-between p-2 hairline-border rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {partenaire.prenom.charAt(0)}{partenaire.nom.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-pnpe-blue leading-tight">{partenaire.prenom} {partenaire.nom}</p>
                  <p className="text-xs text-gray-500">{partenaire.email}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-pnpe-blue transition-colors">
                <Mail size={14} />
              </button>
            </div>
          ))}
          
          {partenaires.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Aucun partenaire externe invité.</p>
          )}
        </div>
      </div>
      
      <div className="p-3 hairline-border-t bg-gray-50 rounded-b-lg">
        <button className="w-full text-xs font-medium text-pnpe-blue hover:underline text-center">
          Voir le journal d'audit des accès
        </button>
      </div>
    </div>
  );
}
