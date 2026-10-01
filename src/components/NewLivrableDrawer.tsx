"use client";

import { useState } from 'react';
import { X, UploadCloud, Calendar as CalendarIcon, Link as LinkIcon, User } from 'lucide-react';

import { useLivrables } from '@/context/LivrablesContext';
import { FormatLivrable, Canal } from '@/types/com-ops';

interface NewLivrableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewLivrableDrawer({ isOpen, onClose }: NewLivrableDrawerProps) {
  const { addLivrable, projets, utilisateurs } = useLivrables();
  
  const [titre, setTitre] = useState('');
  const [format, setFormat] = useState<FormatLivrable>('Flyer');
  const [canal, setCanal] = useState<Canal>('LinkedIn');
  const [brief, setBrief] = useState('');
  const [date, setDate] = useState('');
  const [projetId, setProjetId] = useState('');
  const [assigneA, setAssigneA] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview (Optimistic)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Compress image
    try {
      const compressedDataUrl = await compressImage(file);
      setPreviewUrl(compressedDataUrl); // store compressed data to save it
    } catch (error) {
      console.error("Erreur de compression", error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !date) return;
    
    addLivrable({
      titre,
      format,
      canal,
      statut: 'en_validation', // Changement ici: direct en validation
      dateCible: new Date(date).toISOString(),
      brief: brief || 'Nouveau brief...',
      commentaires: [],
      projetId: projetId || undefined,
      assigneA: assigneA || undefined,
      piecesJointes: previewUrl ? [previewUrl] : undefined
    });
    
    // Reset et fermeture
    setTitre('');
    setBrief('');
    setProjetId('');
    setAssigneA('');
    setPreviewUrl(null);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-pnpe-blue/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
        
        <div className="flex items-center justify-between p-6 hairline-border-b bg-gray-50/80">
          <div>
            <h2 className="text-lg font-bold text-pnpe-blue">Nouveau Contenu</h2>
            <p className="text-xs text-gray-500">Créez un nouveau livrable ou une publication</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-pnpe-blue hover:bg-white rounded-full transition-colors hairline-border"
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
                placeholder="Ex: Teaser vidéo J-15"
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green transition-colors"
              />
            </div>

            {/* Format & Canal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Format</label>
                <select 
                  value={format}
                  onChange={e => setFormat(e.target.value as FormatLivrable)}
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
                >
                  <option value="Flyer">Flyer</option>
                  <option value="Carrousel">Carrousel</option>
                  <option value="Vidéo">Vidéo</option>
                  <option value="Communiqué">Communiqué</option>
                  <option value="Bâche">Bâche</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Canal cible</label>
                <select 
                  value={canal}
                  onChange={e => setCanal(e.target.value as Canal)}
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="X">X</option>
                  <option value="Presse">Presse</option>
                  <option value="Affichage">Affichage</option>
                </select>
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
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
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
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
              />
            </div>

            {/* Brief */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brief créatif & Copywriting</label>
              <textarea 
                value={brief}
                onChange={e => setBrief(e.target.value)}
                rows={4}
                placeholder="Décrivez ce qui doit être produit..."
                className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green resize-none"
              ></textarea>
            </div>

            {/* Fichiers */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fichiers (Maquettes, Logos, etc.)</label>
              <label className="w-full border-2 border-dashed border-gray-200 rounded-md p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 hover:border-pnpe-green transition-colors cursor-pointer group">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                {previewUrl ? (
                  <img src={previewUrl} alt="Aperçu" className="max-h-32 rounded-md object-contain" />
                ) : (
                  <>
                    <UploadCloud size={24} className="mb-2 group-hover:text-pnpe-green transition-colors" />
                    <span className="text-sm font-medium">Cliquez ou glissez-déposez une image</span>
                  </>
                )}
              </label>
            </div>
            
            {/* Assignation */}
            <div className="grid grid-cols-2 gap-4 pt-4 hairline-border-t">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <User size={14} /> Créateur
                </label>
                <select 
                  value={assigneA}
                  onChange={e => setAssigneA(e.target.value)}
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-green focus:border-pnpe-green"
                >
                  <option value="">Sélectionner...</option>
                  {utilisateurs.map(u => (
                    <option key={`c-${u.id}`} value={u.id}>{u.prenom} {u.nom}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 hairline-border-t bg-gray-50 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hairline-border rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-pnpe-green rounded-md hover:bg-pnpe-green-light transition-colors shadow-sm"
            >
              Créer le livrable
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
