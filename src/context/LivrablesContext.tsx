"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Livrable, StatutLivrable, ProjetEvenement, Utilisateur, ROLES_PAR_DEFAUT } from '@/types/com-ops';
import { supabase } from '@/lib/supabaseClient';

const DEFAULT_USERS: Utilisateur[] = [
  { id: 'u1', nom: 'Admin', prenom: 'Directeur', email: 'admin@pnpe.ga', role: 'Admin / Directeur', droits: { depotContenu: true, pouvoirValidation: true, accesLimite: false } },
  { id: 'u2', nom: 'Rédacteur', prenom: 'CM', email: 'cm@pnpe.ga', role: 'Rédacteur / CM', droits: { depotContenu: true, pouvoirValidation: false, accesLimite: false } },
  { id: 'u3', nom: 'Graphiste', prenom: 'Vidéo', email: 'graphiste@pnpe.ga', role: 'Graphiste / Vidéo', droits: { depotContenu: true, pouvoirValidation: false, accesLimite: false } }
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
  addLivrable: (livrable: Omit<Livrable, 'id'>, lotId?: string) => void;
  updateLivrableStatus: (id: string, newStatut: StatutLivrable, remark?: string, newDateCible?: string) => void;
  deleteLivrable: (id: string) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info') => void;
  removeToast: (id: string) => void;
  isLoading: boolean;
  isDrawerOpen: boolean;
  defaultProjetIdForDrawer: string | null;
  defaultLotIdForDrawer: string | null;
  openDrawer: (projetId?: string, lotId?: string) => void;
  closeDrawer: () => void;
  addProjet: (projet: Omit<ProjetEvenement, 'id' | 'chefDeProjetId' | 'jaugeAvancement' | 'lotsTravail' | 'membresInternes' | 'partenairesExternes'>) => void;
  isProjetDrawerOpen: boolean;
  openProjetDrawer: () => void;
  closeProjetDrawer: () => void;
  addLotToProjet: (projetId: string, lot: { id: string; nom: string; description: string; livrablesId: string[] }) => void;
  addPartenaireToProjet: (projetId: string, userId: string) => void;
  addUtilisateur: (user: Omit<Utilisateur, 'id'> & { motDePasse?: string }) => void;
  rolesDisponibles: string[];
  isUserModalOpen: boolean;
  openUserModal: () => void;
  closeUserModal: () => void;
  currentUser: Utilisateur | null;
}

const LivrablesContext = createContext<LivrablesContextType | undefined>(undefined);

export function LivrablesProvider({ children }: { children: ReactNode }) {
  const [livrables, setLivrables] = useState<Livrable[]>([]);
  const [projets, setProjets] = useState<ProjetEvenement[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
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
      const formattedLivs: Livrable[] = (livs || []).map((l: any) => {
        let parsedCanaux = ['LinkedIn'];
        try {
          if (l.canal) {
            parsedCanaux = l.canal.startsWith('[') ? JSON.parse(l.canal) : [l.canal];
          }
        } catch (e) {
          parsedCanaux = [l.canal];
        }

        return {
          ...l,
          canaux: parsedCanaux,
          dateCible: l.date_cible,
          assigneA: l.assigne_a,
          projetId: l.projet_id,
          piecesJointes: l.pieces_jointes,
          commentaires: [] // On peut charger les commentaires dans une query séparée si besoin
        };
      });
      
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
        avatarUrl: u.avatar_url,
        droits: u.droits || { depotContenu: true, pouvoirValidation: false, accesLimite: false },
        projetLimiteId: u.projet_limite_id
      }));

      setLivrables(formattedLivs);
      setProjets(formattedProjs);
      setUtilisateurs(formattedUsers);

      // Auth current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const found = formattedUsers.find(u => u.email === authUser.email);
        if (found) setCurrentUser(found);
      }
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

  const addLivrable = async (livrable: Omit<Livrable, 'id'>, lotId?: string) => {
    let newLivrable: Livrable;
    
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('livrables').insert([{
          titre: livrable.titre,
          format: livrable.format,
          canal: livrable.canaux[0] || 'LinkedIn', // Colonne DB avec CHECK constraint
          statut: livrable.statut,
          date_cible: livrable.dateCible,
          brief: livrable.brief,
          assigne_a: livrable.assigneA,
          projet_id: livrable.projetId,
          pieces_jointes: livrable.piecesJointes
        }]).select().single();
        if (error) throw error;
        
        // Optimistic UI
        newLivrable = {
          ...data,
          canaux: livrable.canaux,
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
        return; // Stop if error
      }
    } else {
      // Mock logic
      newLivrable = {
        ...livrable,
        id: `liv${livrables.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
      };
      setLivrables(prev => [...prev, newLivrable]);
      addToast('Nouveau livrable créé (Mode Mock) !');
    }

    // Si on l'a ajouté depuis un lot, on met à jour le lot dans le projet
    if (lotId && newLivrable.projetId) {
      setProjets(prev => prev.map(p => {
        if (p.id === newLivrable.projetId) {
          return {
            ...p,
            lotsTravail: p.lotsTravail.map(lot => 
              lot.id === lotId ? { ...lot, livrablesId: [...lot.livrablesId, newLivrable.id] } : lot
            )
          };
        }
        return p;
      }));
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
      } catch (err: any) {
        console.error("SUPABASE UPDATE ERROR:", JSON.stringify(err, null, 2), err);
        // Appliquer quand même la mise à jour en local (optimiste)
        setLivrables(prev => prev.map(l => l.id === id ? { ...l, statut: newStatut, ...(newDateCible ? { dateCible: newDateCible } : {}) } : l));
        addToast(`Statut mis à jour localement (erreur Supabase: ${err?.message || 'inconnue'}).`, 'info');
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
  const [defaultProjetIdForDrawer, setDefaultProjetIdForDrawer] = useState<string | null>(null);
  const [defaultLotIdForDrawer, setDefaultLotIdForDrawer] = useState<string | null>(null);

  const openDrawer = (projetId?: string, lotId?: string) => {
    setDefaultProjetIdForDrawer(projetId || null);
    setDefaultLotIdForDrawer(lotId || null);
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setDefaultProjetIdForDrawer(null);
      setDefaultLotIdForDrawer(null);
    }, 300);
  };

  const [isProjetDrawerOpen, setIsProjetDrawerOpen] = useState(false);
  const openProjetDrawer = () => setIsProjetDrawerOpen(true);
  const closeProjetDrawer = () => setIsProjetDrawerOpen(false);

  const addLotToProjet = async (projetId: string, lot: { id: string; nom: string; description: string; livrablesId: string[] }) => {
    setProjets(prev => prev.map(p => {
      if (p.id === projetId) {
        return { ...p, lotsTravail: [...p.lotsTravail, lot] };
      }
      return p;
    }));
    addToast('Lot ajouté avec succès !', 'success');
  };

  const addPartenaireToProjet = async (projetId: string, userId: string) => {
    setProjets(prev => prev.map(p => {
      if (p.id === projetId && !p.partenairesExternes.includes(userId)) {
        return { ...p, partenairesExternes: [...p.partenairesExternes, userId] };
      }
      return p;
    }));
    addToast('Partenaire ajouté avec succès !', 'success');
  };

  // --- Gestion des utilisateurs ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const openUserModal = () => setIsUserModalOpen(true);
  const closeUserModal = () => setIsUserModalOpen(false);

  const addUtilisateur = async (user: Omit<Utilisateur, 'id'> & { motDePasse?: string }) => {
    if (isSupabaseConfigured) {
      try {
        // 1. Créer le compte Auth via la Server Action (pour ne pas déconnecter l'admin)
        if (user.motDePasse) {
          const { createUserAuth } = await import('@/app/actions/createUser');
          const authRes = await createUserAuth(user.email, user.motDePasse, user.nom, user.prenom);
          if (authRes.error) {
             throw new Error(authRes.error);
          }
        }

        // 2. Insérer dans la table utilisateurs
        const { data, error } = await supabase.from('utilisateurs').insert([{
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        }]).select().single();
        if (error) throw error;

        const newUser: Utilisateur = {
          ...data,
          avatarUrl: data.avatar_url,
          droits: user.droits,
          projetLimiteId: user.projetLimiteId,
        };
        setUtilisateurs(prev => [...prev, newUser]);
        addToast(`${user.prenom} ${user.nom} ajouté à l'équipe !`, 'success');
      } catch (err: any) {
        console.error("SUPABASE USER ERROR:", JSON.stringify(err, null, 2), err);
        // Fallback local
        const newUser: Utilisateur = {
          ...user,
          id: `u${utilisateurs.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
        };
        setUtilisateurs(prev => [...prev, newUser]);
        addToast(`${user.prenom} ${user.nom} ajouté localement !`, 'info');
      }
    } else {
      const newUser: Utilisateur = {
        ...user,
        id: `u${utilisateurs.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
      };
      setUtilisateurs(prev => [...prev, newUser]);
      addToast(`${user.prenom} ${user.nom} ajouté à l'équipe !`, 'success');
    }
    closeUserModal();
  };

  const rolesDisponibles = useMemo(() => {
    return Array.from(new Set([
      ...ROLES_PAR_DEFAUT,
      ...utilisateurs.map(u => u.role),
    ]));
  }, [utilisateurs]);

  return (
    <LivrablesContext.Provider value={{ 
      livrables, projets, utilisateurs, addLivrable, updateLivrableStatus, deleteLivrable, toasts, addToast, removeToast, isLoading,
      isDrawerOpen, defaultProjetIdForDrawer, defaultLotIdForDrawer, openDrawer, closeDrawer,
      addProjet, isProjetDrawerOpen, openProjetDrawer, closeProjetDrawer, addLotToProjet, addPartenaireToProjet,
      addUtilisateur, rolesDisponibles, isUserModalOpen, openUserModal, closeUserModal, currentUser
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`px-4 py-3 rounded-md shadow-lg hairline-border flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 ${
              toast.type === 'success' ? 'bg-pnpe-blue text-white' : 'bg-pnpe-blue text-white'
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
