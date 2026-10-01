"use client";

import { useState, useRef } from 'react';
import { useLivrables } from '@/context/LivrablesContext';
import { Briefcase, Plus, Image as ImageIcon, Check, X, MessageSquare, Clock, Calendar } from 'lucide-react';
import { Livrable, StatutLivrable, Canal } from '@/types/com-ops';

export default function OffresPage() {
  const { livrables, addLivrable, updateLivrableStatus, utilisateurs } = useLivrables();
  
  // États de la page
  const [isDepotOpen, setIsDepotOpen] = useState(false);
  const [validationLivrable, setValidationLivrable] = useState<Livrable | null>(null);

  // Filtre des offres : on utilise 'Flyer' et un titre spécifique pour éviter les erreurs d'ENUM dans Supabase
  const offres = livrables.filter(l => l.titre.startsWith('[OFFRE]'));
  
  const offresEnValidation = offres.filter(l => l.statut === 'en_validation');
  const offresACorriger = offres.filter(l => l.statut === 'a_corriger' || l.statut === 'conception');
  const offresValidees = offres.filter(l => l.statut === 'programme' || l.statut === 'publie');

  const getUserName = (id?: string) => {
    const user = utilisateurs.find(u => u.id === id);
    return user ? user.prenom : 'Anonyme';
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-blue tracking-tight flex items-center gap-2">
            <Briefcase size={24} className="text-pnpe-green" />
            Circuit de validation des Offres
          </h1>
          <p className="text-sm text-gray-500 mt-1">Workflow rapide pour remplacer WhatsApp</p>
        </div>
        <button 
          onClick={() => setIsDepotOpen(true)}
          className="bg-pnpe-green hover:bg-pnpe-green-light text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Déposer une offre traitée
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Colonne 1 : En attente */}
        <Column 
          title="En attente de validation" 
          count={offresEnValidation.length} 
          color="bg-orange-100 text-orange-800 border-orange-400"
          items={offresEnValidation}
          onClickCard={setValidationLivrable}
          getUserName={getUserName}
        />
        
        {/* Colonne 2 : À corriger */}
        <Column 
          title="À corriger" 
          count={offresACorriger.length} 
          color="bg-red-100 text-red-800 border-red-400"
          items={offresACorriger}
          getUserName={getUserName}
        />
        
        {/* Colonne 3 : Validé & Programmé */}
        <Column 
          title="Validé & Programmé" 
          count={offresValidees.length} 
          color="bg-pnpe-green/20 text-green-800 border-pnpe-green"
          items={offresValidees}
          getUserName={getUserName}
        />
      </div>

      {/* Modal de Dépôt */}
      {isDepotOpen && (
        <DepotModal 
          onClose={() => setIsDepotOpen(false)} 
          onSubmit={(data: any) => {
            addLivrable({
              titre: `[OFFRE] Offre Canva - ${new Date().toLocaleDateString()}`,
              format: 'Flyer',
              canal: data.canal,
              statut: 'en_validation',
              dateCible: new Date().toISOString(),
              brief: data.imageString, // On utilise le brief pour stocker l'image en base64
              commentaires: []
            });
            setIsDepotOpen(false);
          }} 
        />
      )}

      {/* Modal de Validation */}
      {validationLivrable && (
        <ValidationModal
          livrable={validationLivrable}
          onClose={() => setValidationLivrable(null)}
          onValidate={(date: string) => {
            updateLivrableStatus(validationLivrable.id, 'programme', undefined, date);
            setValidationLivrable(null);
          }}
          onRefuse={(motif: string) => {
            updateLivrableStatus(validationLivrable.id, 'a_corriger', motif);
            setValidationLivrable(null);
          }}
        />
      )}
    </div>
  );
}

// Composant Colonne
function Column({ title, count, color, items, onClickCard, getUserName }: any) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50/50 rounded-xl hairline-border overflow-hidden">
      <div className={`p-4 border-t-4 bg-white hairline-border-b flex justify-between items-center ${color}`}>
        <h3 className="font-bold text-sm tracking-wide">{title}</h3>
        <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item: any) => (
          <div 
            key={item.id} 
            onClick={() => onClickCard && onClickCard(item)}
            className={`bg-white rounded-lg hairline-border p-3 shadow-sm transition-all ${onClickCard ? 'cursor-pointer hover:shadow-md hover:border-pnpe-blue/30' : ''}`}
          >
            {/* Si c'est une image base64 on l'affiche, sinon placeholder */}
            <div className="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
              {item.brief && item.brief.startsWith('data:image') ? (
                <img src={item.brief} alt="Visuel" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-gray-300" />
              )}
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase">{item.canal}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} /> {new Date(item.dateCible).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Par {getUserName(item.assigneA)}</p>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <Briefcase size={24} className="text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-500 mb-1">Aucune offre ici</p>
            {title === "En attente de validation" ? (
              <p className="text-xs text-gray-400">Cliquez sur "+ Déposer une offre" pour commencer</p>
            ) : (
              <p className="text-xs text-gray-400">Rien à afficher pour le moment.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Modal de Dépôt
function DepotModal({ onClose, onSubmit }: any) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageString, setImageString] = useState('');
  const [canal, setCanal] = useState<Canal>('LinkedIn');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Instant preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Compression
      try {
        const compressed = await compressImage(file);
        setImageString(compressed);
      } catch (err) {
        console.error("Erreur de compression", err);
        // Fallback
        const reader = new FileReader();
        reader.onloadend = () => setImageString(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > 1920) {
          height = Math.round((height * 1920) / width);
          width = 1920;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/webp', 0.8));
      };
      img.onerror = reject;
    });
  };

  return (
    <div className="fixed inset-0 bg-pnpe-blue/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-pnpe-blue">Déposer une offre (Depuis Canva)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Visuel de l'offre (PNG/JPG)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-pnpe-green transition-colors overflow-hidden relative"
            >
              {(previewUrl || imageString) ? (
                <img src={previewUrl || imageString} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <>
                  <ImageIcon size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">Cliquez ou glissez l'image ici</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

          {/* Canal */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Canal de diffusion</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setCanal('LinkedIn')}
                className={`flex-1 py-2 rounded-md border text-sm font-bold transition-colors ${canal === 'LinkedIn' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                LinkedIn
              </button>
              <button 
                onClick={() => setCanal('Facebook')}
                className={`flex-1 py-2 rounded-md border text-sm font-bold transition-colors ${canal === 'Facebook' ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Facebook
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button 
            disabled={!imageString}
            onClick={() => onSubmit({ imageString, canal })}
            className="w-full bg-pnpe-blue hover:bg-pnpe-blue-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Envoyer pour validation
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Validation
function ValidationModal({ livrable, onClose, onValidate, onRefuse }: any) {
  const [motif, setMotif] = useState('');
  const [date, setDate] = useState('');

  return (
    <div className="fixed inset-0 bg-pnpe-blue/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden animate-in zoom-in-95">
        
        {/* Colonne Image (Grand format) */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center p-4">
          {livrable.brief && livrable.brief.startsWith('data:image') ? (
            <img src={livrable.brief} alt="Visuel" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <ImageIcon size={48} className="mb-2" />
              <span>Aucune image fournie</span>
            </div>
          )}
        </div>

        {/* Colonne Actions */}
        <div className="w-96 bg-white flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-pnpe-blue text-lg">Validation</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            {/* Action 1 : Valider */}
            <div className="space-y-3 bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-bold text-green-800 flex items-center gap-2"><Check size={18} /> Option A : Approuver</h3>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <input 
                  type="datetime-local" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-sm p-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-pnpe-green"
                />
              </div>
              <button 
                onClick={() => onValidate(date)}
                className="w-full bg-pnpe-green hover:bg-pnpe-green-light text-white font-bold py-3 rounded-md transition-colors"
              >
                Valider & Programmer
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-xs text-gray-400 font-bold uppercase relative z-10">OU</span>
            </div>

            {/* Action 2 : Refuser */}
            <div className="space-y-3 bg-orange-50 p-4 rounded-lg border border-orange-100">
              <h3 className="font-bold text-orange-800 flex items-center gap-2"><MessageSquare size={18} /> Option B : Demander correction</h3>
              <textarea 
                value={motif}
                onChange={e => setMotif(e.target.value)}
                placeholder="Ex: Le logo est trop petit, ou il manque la date de clôture..."
                rows={3}
                className="w-full text-sm p-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-400 resize-none"
              ></textarea>
              <button 
                disabled={!motif}
                onClick={() => onRefuse(motif)}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-md transition-colors"
              >
                Renvoyer "À corriger"
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
