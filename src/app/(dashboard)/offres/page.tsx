"use client";

import { useState, useRef } from 'react';
import { useLivrables } from '@/context/LivrablesContext';
import { useUI } from '@/context/UIContext';
import { Briefcase, Plus, Image as ImageIcon, Check, X, MessageSquare, Clock, Calendar, Download, Loader2 } from 'lucide-react';
import { Livrable, Canal } from '@/types/com-ops';
import { uploadMediaToSupabase, dataURLtoBlob } from '@/utils/supabase/storageClient';

export default function OffresPage() {
  const { livrables, addLivrable, updateLivrableStatus, utilisateurs, currentUser } = useLivrables();
  const { addToast } = useUI();
  
  // États de la page
  const [isDepotOpen, setIsDepotOpen] = useState(false);
  const [validationLivrable, setValidationLivrable] = useState<Livrable | null>(null);
  
  // Droits RBAC
  const canValidate = currentUser?.droits?.pouvoirValidation === true;

  // Filtre des offres formel (format === 'Offre')
  const offres = livrables.filter(l => l.format === 'Offre');
  
  const offresEnValidation = offres.filter(l => l.statut === 'en_validation');
  const offresACorriger = offres.filter(l => l.statut === 'a_corriger' || l.statut === 'conception');
  const offresValidees = offres.filter(l => l.statut === 'programme');

  const getUserName = (id?: string) => {
    const user = utilisateurs.find(u => u.id === id);
    return user ? user.prenom : 'Anonyme';
  };

  const handleDownloadAndClose = (item: Livrable) => {
    // 1. Téléchargement de l'image (si possible)
    const imageUrl = (item.piecesJointes && item.piecesJointes.length > 0) ? item.piecesJointes[0] : null;
      
    if (imageUrl) {
      // Pour une URL distante, on ouvre dans un nouvel onglet ou on déclenche un fetch blob
      // L'attribut download="file" ne marche bien que sur la même origine, on fallback sur window.open
      if (imageUrl.startsWith('http')) {
        window.open(imageUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `offre_${item.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    
    // 2. Passage au statut publié pour archiver proprement (au lieu de deleteLivrable)
    updateLivrableStatus(item.id, 'publie');
    addToast('Offre archivée (statut Publié)', 'success');
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-dark tracking-tight flex items-center gap-2">
            <Briefcase size={24} className="text-pnpe-blue" />
            Circuit de validation des Offres
          </h1>
          <p className="text-sm text-gray-500 mt-1">Workflow rapide et structuré pour la publication des offres</p>
        </div>
        <button 
          onClick={() => setIsDepotOpen(true)}
          className="bg-pnpe-blue hover:bg-pnpe-blue-hover text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
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
          onClickCard={canValidate ? setValidationLivrable : undefined}
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
          color="bg-pnpe-blue/20 text-green-800 border-pnpe-blue"
          items={offresValidees}
          getUserName={getUserName}
          onDownload={handleDownloadAndClose}
        />
      </div>

      {/* Modal de Dépôt */}
      {isDepotOpen && (
        <DepotModal 
          onClose={() => setIsDepotOpen(false)} 
          onSubmit={async (data: { imageUrl: string, canaux: Canal[] }) => {
            addLivrable({
              titre: `Offre Canva - ${new Date().toLocaleDateString()}`,
              format: 'Offre', // Vrai format formel
              canaux: data.canaux,
              statut: 'en_validation',
              dateCible: new Date().toISOString(),
              brief: "Offre d'emploi traitée",
              piecesJointes: [data.imageUrl], // On sauvegarde la vraie URL du bucket
              commentaires: []
            });
            setIsDepotOpen(false);
          }} 
        />
      )}

      {/* Modal de Validation */}
      {validationLivrable && canValidate && (
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
function Column({ title, count, color, items, onClickCard, getUserName, onDownload }: any) {
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
            className={`bg-white rounded-lg hairline-border p-3 shadow-sm transition-all relative ${onClickCard ? 'cursor-pointer hover:shadow-md hover:border-pnpe-blue/30' : ''}`}
          >
            <div onClick={() => onClickCard && onClickCard(item)}>
              <div className="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {item.piecesJointes && item.piecesJointes.length > 0 ? (
                  <img src={item.piecesJointes[0]} alt="Visuel" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-300" />
                )}
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase">{item.canaux?.join(', ')}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {new Date(item.dateCible).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Par {getUserName(item.assigneA)}</p>
            </div>
            
            {onDownload && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(item);
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs py-2 rounded transition-colors"
                title="Télécharger l'image et archiver l'offre"
              >
                <Download size={14} /> Archiver l'offre
              </button>
            )}
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

// Modal de Dépôt avec upload Supabase Storage
function DepotModal({ onClose, onSubmit }: any) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [canaux, setCanaux] = useState<Canal[]>(['LinkedIn']);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Prévisualisation immédiate (Optimistic)
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async () => {
    if (!previewUrl || canaux.length === 0) return;
    setIsUploading(true);

    try {
      let finalUrl = previewUrl;

      // Si c'est un object URL local, on récupère le fichier original depuis l'input
      if (previewUrl.startsWith('blob:')) {
        const file = fileInputRef.current?.files?.[0];
        if (file) {
          // On compresse et on upload vers le Bucket Supabase
          const compressedDataUrl = await compressImage(file);
          const blob = dataURLtoBlob(compressedDataUrl);
          
          const uploadedUrl = await uploadMediaToSupabase(blob, 'medias');
          
          if (uploadedUrl) {
            finalUrl = uploadedUrl; // On utilise l'URL distante
          } else {
            console.warn("L'upload Supabase a échoué, on sauvegarde en base64 en mode fallback");
            finalUrl = compressedDataUrl;
          }
        }
      }

      onSubmit({ imageUrl: finalUrl, canaux });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
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
          <h2 className="font-bold text-pnpe-dark">Déposer une offre</h2>
          <button onClick={onClose} disabled={isUploading} className="text-gray-400 hover:text-gray-600 disabled:opacity-50"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Visuel de l'offre (PNG/JPG)</label>
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative transition-colors ${!isUploading ? 'cursor-pointer hover:bg-gray-100 hover:border-pnpe-blue' : 'opacity-80'}`}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <>
                  <ImageIcon size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">Cliquez pour ajouter l'image</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Canaux de diffusion</label>
            <div className="flex gap-3">
              <button 
                disabled={isUploading}
                onClick={() => setCanaux(prev => prev.includes('LinkedIn') ? prev.filter(c => c !== 'LinkedIn') : [...prev, 'LinkedIn'])}
                className={`flex-1 py-2 rounded-md border text-sm font-bold transition-colors disabled:opacity-50 ${canaux.includes('LinkedIn') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                LinkedIn
              </button>
              <button 
                disabled={isUploading}
                onClick={() => setCanaux(prev => prev.includes('Facebook') ? prev.filter(c => c !== 'Facebook') : [...prev, 'Facebook'])}
                className={`flex-1 py-2 rounded-md border text-sm font-bold transition-colors disabled:opacity-50 ${canaux.includes('Facebook') ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Facebook
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button 
            disabled={!previewUrl || canaux.length === 0 || isUploading}
            onClick={handleSubmit}
            className="w-full bg-pnpe-blue hover:bg-pnpe-blue-light disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Transfert en cours...
              </>
            ) : (
              'Envoyer pour validation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Validation
function ValidationModal({ livrable, onClose, onValidate, onRefuse }: any) {
  const [motif, setMotif] = useState('');
  // Initialize with livrable's target date for better UX
  const [date, setDate] = useState(livrable.dateCible ? livrable.dateCible.substring(0, 16) : '');

  return (
    <div className="fixed inset-0 bg-pnpe-blue/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden animate-in zoom-in-95">
        
        {/* Colonne Image (Grand format) */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center p-4">
          {livrable.piecesJointes && livrable.piecesJointes.length > 0 ? (
            <img src={livrable.piecesJointes[0]} alt="Visuel" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
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
            <h2 className="font-bold text-pnpe-dark text-lg">Validation</h2>
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
                  className="w-full text-sm p-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-pnpe-blue"
                />
              </div>
              <button 
                onClick={() => onValidate(new Date(date).toISOString())}
                disabled={!date}
                className="w-full bg-pnpe-blue hover:bg-pnpe-blue-hover text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50"
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
