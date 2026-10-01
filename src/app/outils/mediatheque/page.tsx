import { Image as ImageIcon, UploadCloud } from 'lucide-react';

export default function MediathequePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-blue tracking-tight flex items-center gap-2">
            <ImageIcon size={24} className="text-gray-400" />
            Médiathèque Centralisée
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gérez tous les visuels, logos et vidéos de la cellule communication.</p>
        </div>
        <button className="bg-pnpe-blue text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-pnpe-blue-light transition-colors text-sm">
          <UploadCloud size={16} /> Importer
        </button>
      </div>

      <div className="bg-white flex-1 rounded-xl hairline-border p-8 flex items-center justify-center text-center">
        <div className="max-w-sm">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 hairline-border">
            <ImageIcon size={24} />
          </div>
          <h3 className="text-lg font-bold text-pnpe-blue mb-2">Aucun fichier</h3>
          <p className="text-sm text-gray-500">Commencez par importer des logos ou des visuels pour les utiliser dans vos briefs et livrables.</p>
        </div>
      </div>
    </div>
  );
}
