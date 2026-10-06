"use client";

import { Newspaper } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function PressePage() {
  const { openDrawer } = useUI();

  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col items-center justify-center text-center">
      <div className="bg-white p-8 rounded-xl hairline-border shadow-sm max-w-md w-full">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Newspaper size={32} />
        </div>
        <h1 className="text-xl font-bold text-pnpe-dark mb-2">Print & Presse</h1>
        <p className="text-sm text-gray-500 mb-6">Base de données des journalistes, historique des communiqués de presse et gestion des partenariats médias traditionnels.</p>
        <button
          onClick={() => openDrawer()}
          className="bg-pnpe-blue hover:bg-pnpe-blue-hover transition-colors text-white font-medium text-sm px-4 py-2 rounded-md w-full shadow-sm"
        >
          Créer un Communiqué de Presse
        </button>
      </div>
    </div>
  );
}
