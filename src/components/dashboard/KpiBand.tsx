"use client";

import { useLivrables } from '@/context/LivrablesContext';
import { FileText, CheckCircle, AlertTriangle, Timer } from 'lucide-react';

export function KpiBand() {
  const { livrables } = useLivrables();
  
  const publicationsSemaine = livrables.filter(l => l.statut === 'publie').length;
  const validationsEnAttente = livrables.filter(l => l.statut === 'en_validation').length;

  const kpis = [
    {
      title: "Publications (semaine)",
      value: publicationsSemaine.toString(),
      trend: "+2 par rapport à S-1",
      icon: FileText,
      color: "text-pnpe-blue",
      bgColor: "bg-pnpe-blue/10"
    },
    {
      title: "Validations en attente",
      value: validationsEnAttente.toString(),
      trend: validationsEnAttente > 0 ? "Action requise" : "Tout est à jour",
      icon: CheckCircle,
      color: "text-pnpe-green",
      bgColor: "bg-pnpe-green/10",
      highlight: validationsEnAttente > 0
    },
    {
      title: "Alertes retards",
      value: "1",
      trend: "Vidéo Teaser (J-30)",
      icon: AlertTriangle,
      color: "text-pnpe-amber",
      bgColor: "bg-pnpe-amber/10"
    },
    {
      title: "Forum Emploi",
      value: "J-45",
      trend: "15 Nov 2026",
      icon: Timer,
      color: "text-pnpe-blue",
      bgColor: "bg-gray-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-lg hairline-border p-4 shadow-sm flex items-start justify-between transition-all ${kpi.highlight ? 'ring-1 ring-pnpe-green shadow-pnpe-green/10' : ''}`}
        >
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-pnpe-blue">{kpi.value}</h3>
            <p className="text-xs text-gray-400 mt-1">{kpi.trend}</p>
          </div>
          <div className={`p-2 rounded-md ${kpi.bgColor}`}>
            <kpi.icon size={20} className={kpi.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
