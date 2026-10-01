import { MessageSquareShare } from 'lucide-react';

export default function ReseauxSociauxPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col items-center justify-center text-center">
      <div className="bg-white p-8 rounded-xl hairline-border shadow-sm max-w-md w-full">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquareShare size={32} />
        </div>
        <h1 className="text-xl font-bold text-pnpe-dark mb-2">Réseaux Sociaux</h1>
        <p className="text-sm text-gray-500 mb-6">Connectez vos comptes sociaux (LinkedIn, Facebook, X, TikTok) pour publier automatiquement vos contenus depuis le pipeline.</p>
        <button className="bg-gray-100 text-gray-400 cursor-not-allowed font-medium text-sm px-4 py-2 rounded-md hairline-border w-full">
          Intégration API en cours de développement...
        </button>
      </div>
    </div>
  );
}
