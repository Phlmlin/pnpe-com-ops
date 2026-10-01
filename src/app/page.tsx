import { KpiBand } from "@/components/dashboard/KpiBand";
import { TodaysRoll } from "@/components/dashboard/TodaysRoll";
import { QuickApproval } from "@/components/dashboard/QuickApproval";
import { ProjectBarometer } from "@/components/dashboard/ProjectBarometer";

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-blue tracking-tight">Cockpit Opérationnel</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de l'activité de la Cellule Communication</p>
        </div>
        <div className="text-sm font-medium text-gray-500">
          Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <KpiBand />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Colonne 1: Dérouleur du jour */}
        <div className="lg:col-span-1 h-full">
          <TodaysRoll />
        </div>

        {/* Colonne 2: Sas d'approbation */}
        <div className="lg:col-span-1 h-full">
          <QuickApproval />
        </div>

        {/* Colonne 3: Baromètre Projet */}
        <div className="lg:col-span-1 h-full flex flex-col gap-6">
          <ProjectBarometer />
          
          {/* Un espace libre pour un futur widget ou une image d'illustration, 
              ici on peut mettre un simple encart de notes rapides */}
          <div className="flex-1 bg-pnpe-blue/5 rounded-lg hairline-border p-4 flex flex-col justify-center items-center text-center">
            <span className="text-pnpe-blue/40 mb-2">Bloc-notes rapide</span>
            <p className="text-xs text-gray-500 max-w-[200px]">
              Espace réservé pour la prise de notes ou les rappels urgents de la direction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
