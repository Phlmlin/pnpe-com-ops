import { supabase } from '@/lib/supabaseClient';

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * 
 * @param file The file to upload (e.g. from an input type="file" or canvas blob)
 * @param bucketName The name of the Supabase storage bucket (default: 'medias')
 * @returns The public URL of the uploaded file, or null if it failed.
 */
export async function uploadMediaToSupabase(file: File | Blob, bucketName: string = 'medias'): Promise<string | null> {
  try {
    // Générer un nom de fichier unique pour éviter les collisions
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'webp';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload dans le bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur Supabase Storage upload:', error);
      return null;
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Exception lors de l\'upload:', error);
    return null;
  }
}

/**
 * Convertit un DataURL (base64) en Blob pour l'upload
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
