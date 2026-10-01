"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Livrable, StatutLivrable, ProjetEvenement, Utilisateur } from '@/types/com-ops';
import { supabase } from '@/lib/supabaseClient';

const DEFAULT_USERS: Utilisateur[] = [
  { id: 'u1', nom: 'Admin', prenom: 'Directeur', email: 'admin@pnpe.ga', role: 'admin_directeur' },
  { id: 'u2', nom: 'Rédacteur', prenom: 'CM', email: 'cm@pnpe.ga', role: 'redacteur_cm' },
  { id: 'u3', nom: 'Graphiste', prenom: 'Vidéo', email: 'graphiste@pnpe.ga', role: 'graphiste_video' }
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

interface LivrablesContextType {
  livrables: Livrable[];
  projets: ProjetEvenement[];
  utilisateurs: Utilisateur[];
  addLivrable: (livrable: Omit<Livrable, 'id'>) => void;
  updateLivrableStatus: (id: string, newStatut: StatutLivrable, remark?: string, newDateCible?: string) => void;
  deleteLivrable: (id: string) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info') => void;
  removeToast: (id: string) => void;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addProjet: (projet: Omit<ProjetEvenement, 'id' | 'chefDeProjetId' | 'jaugeAvancement' | 'lotsTravail' | 'membresInternes' | 'partenairesExternes'>) => void;
  isProjetDrawerOpen: boolean;
  openProjetDrawer: () => void;
  closeProjetDrawer: () => void;
}

const LivrablesContext = createContext<LivrablesContextType | undefined>(undefined);

export function LivrablesProvider({ children }: { children: ReactNode }) {
  const [livrables, setLivrables] = useState<Livrable[]>([]);
  const [projets, setProjets] = useState<ProjetEvenement[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si Supabase est configuré
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;

  useEffect(() => {
    let channel: any;

    if (isSupabaseConfigured) {
      fetchDataFromSupabase();
      
      // Écouter les changements en temps réel sur la table livrables
      channel = supabase
        .channel('livrables_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'livrables' }, (payload: any) => {
          console.log('Changement détecté !', payload);
          fetchDataFromSupabase(); // Pour faire simple, on recharge tout
        })
        .subscribe();
    } else {
      // Fallback sur LocalStorage si Supabase n'est pas encore configuré
      console.warn("Supabase n'est pas configuré. Utilisation du LocalStorage.");
      const savedLivrables = localStorage.getItem('pnpe_livrables');
      const savedProjets = localStorage.getItem('pnpe_projets');
      const savedUsers = localStorage.getItem('pnpe_utilisateurs');
      
      setLivrables(savedLivrables ? JSON.parse(savedLivrables) : []);
      setProjets(savedProjets ? JSON.parse(savedProjets) : []);
      setUtilisateurs(savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS);
      setIsLoading(false);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isSupabaseConfigured]);

  useEffect(() => {
    if (!isSupabaseConfigured && !isLoading) {
      localStorage.setItem('pnpe_livrables', JSON.stringify(livrables));
      localStorage.setItem('pnpe_projets', JSON.stringify(projets));
      localStorage.setItem('pnpe_utilisateurs', JSON.stringify(utilisateurs));
    }
  }, [livrables, projets, utilisateurs, isSupabaseConfigured, isLoading]);

  const fetchDataFromSupabase = async () => {
    setIsLoading(true);
    try {
      // Fetch Livrables
      const { data: livs, error: livsErr } = await supabase.from('livrables').select('*');
      if (livsErr) throw livsErr;
      
      // On mappe la structure Supabase vers notre type TypeScript si besoin
      const formattedLivs: Livrable[] = (livs || []).map((l: any) => ({
        ...l,
        dateCible: l.date_cible,
        assigneA: l.assigne_a,
        projetId: l.projet_id,
        commentaires: [] // On peut charger les commentaires dans une query séparée si besoin
      }));
      
      // Fetch Projets
      const { data: projs, error: projsErr } = await supabase.from('projets').select('*');
      if (projsErr) throw projsErr;
      
      const formattedProjs: ProjetEvenement[] = (projs || []).map((p: any) => ({
        ...p,
        dateDebut: p.date_debut,
        dateFin: p.date_fin,
        chefDeProjetId: p.chef_de_projet_id,
        jaugeAvancement: p.jauge_avancement,
        lotsTravail: [],
        membresInternes: [],
        partenairesExternes: []
      }));

      // Fetch Utilisateurs
      const { data: users, error: usersErr } = await supabase.from('utilisateurs').select('*');
      if (usersErr) throw usersErr;

      const formattedUsers: Utilisateur[] = (users || []).map((u: any) => ({
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatar_url
      }));

      setLivrables(formattedLivs);
      setProjets(formattedProjs);
      setUtilisateurs(formattedUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des données Supabase', error);
      addToast('Erreur de connexion à Supabase', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addLivrable = async (livrable: Omit<Livrable, 'id'>) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('livrables').insert([{
          titre: livrable.titre,
          format: livrable.format,
          canal: livrable.canal,
          statut: livrable.statut,
          date_cible: livrable.dateCible,
          brief: livrable.brief,
          assigne_a: livrable.assigneA,
          projet_id: livrable.projetId
        }]).select().single();
        if (error) throw error;
        
        // Optimistic UI : on ajoute l'élément dans le state avec son vrai ID fraîchement créé
        const newLivrable: Livrable = {
          ...data,
          dateCible: data.date_cible,
          assigneA: data.assigne_a,
          projetId: data.projet_id,
          commentaires: []
        };
        setLivrables(prev => [...prev, newLivrable]);
        
        addToast('Livrable sauvegardé dans Supabase !', 'success');
      } catch (err: any) {
        console.error("SUPABASE ERROR:", JSON.stringify(err, null, 2), err);
        addToast(`Erreur d'enregistrement: ${err?.message || 'Erreur inconnue'}`, 'info');
      }
    } else {
      // Mock logic
      const newLivrable = {
        ...livrable,
        id: `liv${livrables.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
      };
      setLivrables(prev => [...prev, newLivrable]);
      addToast('Nouveau livrable créé (Mode Mock) !');
    }
  };

  const updateLivrableStatus = async (id: string, newStatut: StatutLivrable, remark?: string, newDateCible?: string) => {
    if (isSupabaseConfigured) {
      try {
        const updateData: any = { statut: newStatut };
        if (newDateCible) updateData.date_cible = newDateCible;
        // In a real app, remark would be inserted into a comments table. For now, we omit it or append to brief.
        
        const { error } = await supabase.from('livrables').update(updateData).eq('id', id);
        if (error) throw error;
        // Si remark, l'ajouter aux commentaires (simplifié)
        addToast(`Statut mis à jour (${newStatut}) dans Supabase !`, 'success');
        
        // Optimistic UI for Supabase (if real-time is slow)
        setLivrables(prev => prev.map(l => l.id === id ? { ...l, statut: newStatut, ...(newDateCible ? { dateCible: newDateCible } : {}) } : l));
      } catch (err) {
        console.error(err);
        addToast("Erreur lors de la mise à jour.", 'info');
      }
    } else {
      // Mock logic
      setLivrables(prev => prev.map(l => {
        if (l.id === id) {
          const updated = { ...l, statut: newStatut };
          if (newDateCible) updated.dateCible = newDateCible;
          if (remark) {
            updated.commentaires = [
              ...(updated.commentaires || []),
              {
                id: `c${Date.now()}`,
                auteurId: utilisateurs[0]?.id || 'u1',
                contenu: remark,
                date: new Date().toISOString()
              }
            ];
          }
          return updated;
        }
        return l;
      }));
      if (newStatut === 'programme') addToast('Livrable validé et programmé !', 'success');
      else if (newStatut === 'conception' || newStatut === 'a_corriger') addToast('Demande de retouche envoyée.', 'info');
      else addToast('Statut mis à jour.', 'success');
    }
  };

  const deleteLivrable = async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('livrables').delete().eq('id', id);
        if (error) throw error;
        setLivrables(prev => prev.filter(l => l.id !== id));
        addToast('Livrable supprimé.', 'success');
      } catch (err) {
        console.error(err);
        addToast("Erreur lors de la suppression.", 'info');
      }
    } else {
      setLivrables(prev => prev.filter(l => l.id !== id));
      addToast('Livrable supprimé.', 'success');
    }
  };

  const addProjet = async (projet: Omit<ProjetEvenement, 'id' | 'chefDeProjetId' | 'jaugeAvancement' | 'lotsTravail' | 'membresInternes' | 'partenairesExternes'>) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('projets').insert([{
          nom: projet.nom,
          description: projet.description,
          date_debut: projet.dateDebut,
          date_fin: projet.dateFin,
          lieu: projet.lieu,
          budget: projet.budget
        }]);
        if (error) throw error;
        fetchDataFromSupabase();
        addToast('Projet/Événement créé avec succès !', 'success');
      } catch (err) {
        console.error(err);
        addToast("Erreur lors de la création de l'événement.", 'info');
      }
    } else {
      const newProjet: ProjetEvenement = {
        ...projet,
        id: `p${projets.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
        chefDeProjetId: '1',
        jaugeAvancement: 0,
        lotsTravail: [],
        membresInternes: [],
        partenairesExternes: []
      };
      setProjets(prev => [...prev, newProjet]);
      addToast('Nouvel événement créé (Mode Mock) !');
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const [isProjetDrawerOpen, setIsProjetDrawerOpen] = useState(false);
  const openProjetDrawer = () => setIsProjetDrawerOpen(true);
  const closeProjetDrawer = () => setIsProjetDrawerOpen(false);

  return (
    <LivrablesContext.Provider value={{ 
      livrables, projets, utilisateurs, addLivrable, updateLivrableStatus, deleteLivrable, toasts, addToast, removeToast, isLoading,
      isDrawerOpen, openDrawer, closeDrawer,
      addProjet, isProjetDrawerOpen, openProjetDrawer, closeProjetDrawer
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`px-4 py-3 rounded-md shadow-lg hairline-border flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 ${
              toast.type === 'success' ? 'bg-pnpe-green text-white' : 'bg-pnpe-blue text-white'
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </LivrablesContext.Provider>
  );
}

export function useLivrables() {
  const context = useContext(LivrablesContext);
  if (context === undefined) {
    throw new Error('useLivrables must be used within a LivrablesProvider');
  }
  return context;
}
