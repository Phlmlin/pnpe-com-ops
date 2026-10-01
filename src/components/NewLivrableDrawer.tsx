"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';

import { useLivrables } from '@/context/LivrablesContext';
import { useUI } from '@/context/UIContext';
import { FormatLivrable, Canal } from '@/types/com-ops';
import { uploadMediaToSupabase, dataURLtoBlob } from '@/utils/supabase/storageClient';

interface NewLivrableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewLivrableDrawer({ isOpen, onClose }: NewLivrableDrawerProps) {
  const { addLivrable, projets } = useLivrables();
  const { defaultProjetIdForDrawer, defaultLotIdForDrawer } = useUI();
  
  const [titre, setTitre] = useState('');
  const [format, setFormat] = useState<FormatLivrable>('Flyer');
  const [canaux, setCanaux] = useState<Canal[]>(['LinkedIn']);
  const [brief, setBrief] = useState('');
  const [date, setDate] = useState('');
  const [projetId, setProjetId] = useState('');
  const [assigneA, setAssigneA] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize projetId if opened with a default
  useEffect(() => {
    if (isOpen && defaultProjetIdForDrawer) {
      setProjetId(defaultProjetIdForDrawer);
    }
  }, [isOpen, defaultProjetIdForDrawer]);
  
  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview (Optimistic)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !date) return;
    
    setIsUploading(true);

    try {
      let finalUrl: string | undefined = undefined;

      if (previewUrl && previewUrl.startsWith('blob:')) {
        const file = fileInputRef.current?.files?.[0];
        if (file) {
          // Compression locale rapide
          const compressedDataUrl = await compressImage(file);
          const blob = dataURLtoBlob(compressedDataUrl);
          
          // Upload sur Supabase Storage
          const uploadedUrl = await uploadMediaToSupabase(blob, 'medias');
          
          if (uploadedUrl) {
            finalUrl = uploadedUrl;
          } else {
            console.warn("Upload Supabase échoué, fallback sur base64.");
            finalUrl = compressedDataUrl;
          }
        }
      }

      addLivrable({
        titre,
        format,
        canaux,
        statut: 'en_validation', // Toujours en validation au départ
        dateCible: new Date(date).toISOString(),
        brief: brief || 'Nouveau brief...',
        commentaires: [],
        projetId: projetId || undefined,
        assigneA: assigneA || undefined,
        piecesJointes: finalUrl ? [finalUrl] : undefined
      }, defaultLotIdForDrawer || undefined);
      
      // Cleanup
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setTitre('');
      setBrief('');
      setProjetId('');
      setAssigneA('');
      setPreviewUrl(null);
      setCanaux(['LinkedIn']);
      setFormat('Flyer');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-pnpe-blue/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={() => !isUploading && onClose()}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
        
        <div className="flex items-center justify-between p-6 hairline-border-b bg-gray-50/80">
          <div>
            <h2 className="text-lg font-bold text-pnpe-dark">Nouveau Contenu</h2>
            <p className="text-xs text-gray-500">Créez un nouveau livrable ou une publication</p>
          </div>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-gray-400 hover:text-pnpe-dark hover:bg-white rounded-full transition-colors hairline-border disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Titre */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Titre du livrable <span className="text-red-500">*</span></label>
              <input 
                required
                value={titre}
                onChange={e => setTitre(e.target.value)}
                type="text" 
                disabled={isUploading}
                placeholder="Ex: Teaser vidéo J-15"
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue transition-colors disabled:opacity-50"
              />
            </div>

            {/* Fichier (Nouveau) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Visuel (optionnel)</label>
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative transition-colors ${!isUploading ? 'cursor-pointer hover:bg-gray-100 hover:border-pnpe-blue' : 'opacity-80'}`}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <ImageIcon size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 font-medium">Cliquez pour ajouter l'image</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            </div>

            {/* Format & Canal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Format</label>
                <select 
                  value={format}
                  onChange={e => setFormat(e.target.value as FormatLivrable)}
                  disabled={isUploading}
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue disabled:opacity-50"
                >
                  <option value="Flyer">Flyer</option>
                  <option value="Carrousel">Carrousel</option>
                  <option value="Vidéo">Vidéo</option>
                  <option value="Communiqué">Communiqué</option>
                  <option value="Bâche">Bâche</option>
                  <option value="Offre">Offre d'emploi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Canaux cibles</label>
                <div className="flex flex-wrap gap-2">
                  {(['Facebook', 'LinkedIn', 'TikTok', 'X', 'Presse', 'Affichage'] as Canal[]).map(c => (
                    <button
                      key={c}
                      type="button"
                      disabled={isUploading}
                      onClick={() => setCanaux(prev => prev.includes(c) ? prev.filter(p => p !== c) : [...prev, c])}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:opacity-50 ${canaux.includes(c) ? 'bg-pnpe-blue text-white border-pnpe-blue font-bold' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rattachement */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <LinkIcon size={14} /> Rattachement
              </label>
              <select 
                value={projetId}
                onChange={e => setProjetId(e.target.value)}
                disabled={isUploading}
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue disabled:opacity-50"
              >
                <option value="">-- Campagne Générale --</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <CalendarIcon size={14} /> Date de publication cible <span className="text-red-500">*</span>
              </label>
              <input 
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                type="date" 
                disabled={isUploading}
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue disabled:opacity-50"
              />
            </div>

            {/* Brief */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brief / Consignes</label>
              <textarea 
                value={brief}
                onChange={e => setBrief(e.target.value)}
                rows={4}
                disabled={isUploading}
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue resize-none disabled:opacity-50"
                placeholder="Décrivez les objectifs, le texte souhaité, ou les contraintes..."
              ></textarea>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={!titre || !date || isUploading}
              className="px-6 py-2 text-sm font-bold text-white bg-pnpe-blue hover:bg-pnpe-blue-hover rounded-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Enregistrement...
                </>
              ) : (
                'Créer le livrable'
              )}
            </button>
          </div>
        </form>

      </div>
    </>
  );
}
