"use client";

import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, UploadCloud, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { uploadMediaToSupabase } from '@/utils/supabase/storageClient';
import { useUI } from '@/context/UIContext';

interface MediaFile {
  name: string;
  url: string;
  createdAt?: string;
}

const BUCKET = 'medias';
const FOLDER = 'uploads';

export default function MediathequePage() {
  const { addToast } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;
      const mapped: MediaFile[] = (data || [])
        .filter((f: any) => f.name !== '.emptyFolderPlaceholder')
        .map((f: any) => {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${f.name}`);
          return { name: f.name, url: urlData.publicUrl, createdAt: f.created_at };
        });
      setFiles(mapped);
    } catch (e) {
      console.error('Erreur chargement médiathèque', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadMediaToSupabase(file, BUCKET);
      if (url) {
        addToast('Fichier importé avec succès', 'success');
        await loadFiles();
      } else {
        addToast("Échec de l'import du fichier", 'info');
      }
    } catch (err) {
      console.error(err);
      addToast("Échec de l'import du fichier", 'info');
    } finally {
      setIsUploading(false);
    }
  };

  const isImage = (name: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-dark tracking-tight flex items-center gap-2">
            <ImageIcon size={24} className="text-gray-400" />
            Médiathèque Centralisée
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gérez tous les visuels, logos et vidéos de la cellule communication.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-pnpe-blue text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-pnpe-blue-light transition-colors text-sm disabled:opacity-60"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          {isUploading ? 'Import en cours…' : 'Importer'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isLoading ? (
        <div className="bg-white flex-1 rounded-xl hairline-border flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white flex-1 rounded-xl hairline-border p-8 flex items-center justify-center text-center">
          <div className="max-w-sm">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 hairline-border">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-lg font-bold text-pnpe-dark mb-2">Aucun fichier</h3>
            <p className="text-sm text-gray-500">Commencez par importer des logos ou des visuels pour les utiliser dans vos briefs et livrables.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white flex-1 rounded-xl hairline-border p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map(f => (
              <a
                key={f.name}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="group hairline-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gray-50"
                title={f.name}
              >
                <div className="aspect-square flex items-center justify-center overflow-hidden bg-gray-100">
                  {isImage(f.name) ? (
                    <img src={f.url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <FileText size={32} className="text-gray-400" />
                  )}
                </div>
                <p className="text-[11px] text-gray-600 truncate px-2 py-1.5">{f.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
