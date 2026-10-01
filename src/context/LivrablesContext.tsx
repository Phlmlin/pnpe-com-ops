"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Livrable, StatutLivrable, ProjetEvenement, Utilisateur, ROLES_PAR_DEFAUT } from '@/types/com-ops';
import { supabase } from '@/lib/supabaseClient';
import { useUI } from './UIContext';

// Pas de mock de données par défaut au chargement (base saine), 
// on garde juste des fallback locaux le temps que Supabase charge ou si offline.
const DEFAULT_USERS: Utilisateur[] = [
  { id: 'u1', nom: 'Admin', prenom: 'Directeur', email: 'admin@pnpe.ga', role: 'Admin / Directeur', droits: { depotContenu: true, pouvoirValidation: true, accesLimite: false } },
];

interface LivrablesContextType {
  livrables: Livrable[];
  projets: ProjetEvenement[];
  utilisateurs: Utilisateur[];
  addLivrable: (livrable: Omit<Livrable, 'id'>, lotId?: string) => void;
  updateLivrableStatus: (id: string, newStatut: StatutLivrable, remark?: string, newDateCible?: string) => void;
  deleteLivrable: (id: string) => void;
  isLoading: boolean;
  addProjet: (projet: Omit<ProjetEvenement, 'id' | 'chefDeProjetId' | 'jaugeAvancement' | 'lotsTravail' | 'membresInternes' | 'partenairesExternes'>) => void;
  addLotToProjet: (projetId: string, lot: { id: string; nom: string; description: string; livrablesId: string[] }) => void;
  addPartenaireToProjet: (projetId: string, userId: string) => void;
  addUtilisateur: (user: Omit<Utilisateur, 'id'> & { motDePasse?: string }) => void;
  rolesDisponibles: string[];
  currentUser: Utilisateur | null;
  logout: () => Promise<void>;
}

const LivrablesContext = createContext<LivrablesContextType | undefined>(undefined);

export function LivrablesProvider({ children }: { children: ReactNode }) {
  const { addToast } = useUI();
  
  const [livrables, setLivrables] = useState<Livrable[]>([]);
  const [projets, setProjets] = useState<ProjetEvenement[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si Supabase est configuré
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;

  useEffect(() => {
    let channel: any;

    if (isSupabaseConfigured) {
      fetchDataFromSupabase();
      
      // Écouter les changements en temps réel
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
      // Fetch Livrables - Optionnel: Ajouter un LIMIT ou une date pour éviter l'OOM
      const { data: livs, error: livsErr } = await supabase.from('livrables').select('*').order('created_at', { ascending: false });
      if (livsErr) throw livsErr;
      
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
          commentaires: []
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

      const formattedUsers: Utilisateur[] = (users || []).map((u: any) => {
        const isAdmin = u.role === 'admin_directeur' || u.role === 'Admin / Directeur' || u.email === 'greenmoundounga@gmail.com';
        return {
          id: u.id,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          role: u.role,
          avatarUrl: u.avatar_url,
          droits: u.droits || { 
            depotContenu: true, 
            pouvoirValidation: isAdmin, 
            accesLimite: u.role === 'partenaire_externe' 
          },
          projetLimiteId: u.projet_limite_id
        };
      });

      setLivrables(formattedLivs);
      setProjets(formattedProjs);
      setUtilisateurs(formattedUsers);

      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
      if (authUser) {
        let found = formattedUsers.find(u => u.email === authUser.email);
        if (!found) {
          // Fallback d'urgence si non présent dans la table utilisateurs
          found = {
            id: authUser.id,
            nom: authUser.user_metadata?.nom || 'Admin',
            prenom: authUser.user_metadata?.prenom || 'Super',
            email: authUser.email || '',
            role: authUser.email === 'greenmoundounga@gmail.com' ? 'Admin / Directeur' : 'Equipe Com',
            droits: { 
              depotContenu: true, 
              pouvoirValidation: authUser.email === 'greenmoundounga@gmail.com', 
              accesLimite: false 
            }
          };
        }
        if (found) setCurrentUser(found);
      } else {
        // Si aucun authUser trouvé par Supabase sur le client, forcer la déconnexion
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données Supabase', error);
      addToast('Erreur de connexion à Supabase', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const addLivrable = async (livrable: Omit<Livrable, 'id'>, lotId?: string) => {
    let newLivrable: Livrable;
    
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('livrables').insert([{
          titre: livrable.titre,
          format: livrable.format,
          canal: livrable.canaux[0] || 'LinkedIn', 
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
        setLivrables(prev => [newLivrable, ...prev]);
        
        addToast('Livrable sauvegardé dans Supabase !', 'success');
      } catch (err: any) {
        console.error("SUPABASE ERROR:", JSON.stringify(err, null, 2), err);
        addToast(`Erreur d'enregistrement: ${err?.message || 'Erreur inconnue'}`, 'info');
        return; // Stop if error
      }
    } else {
      newLivrable = {
        ...livrable,
        id: `liv${livrables.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
      };
      setLivrables(prev => [newLivrable, ...prev]);
      addToast('Nouveau livrable créé (Mode Mock) !');
    }

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
    // Optimistic Update Local
    setLivrables(prev => prev.map(l => l.id === id ? { ...l, statut: newStatut, ...(newDateCible ? { dateCible: newDateCible } : {}) } : l));

    if (isSupabaseConfigured) {
      try {
        const updateData: any = { statut: newStatut };
        if (newDateCible) updateData.date_cible = newDateCible;
        
        const { error } = await supabase.from('livrables').update(updateData).eq('id', id);
        if (error) throw error;
        addToast(`Statut mis à jour (${newStatut}) !`, 'success');
      } catch (err: any) {
        console.error("SUPABASE UPDATE ERROR:", JSON.stringify(err, null, 2), err);
        addToast(`Statut mis à jour localement (erreur Supabase: ${err?.message || 'inconnue'}).`, 'info');
      }
    } else {
      addToast(`Statut mis à jour localement (${newStatut}).`);
    }
  };

  const deleteLivrable = async (id: string) => {
    setLivrables(prev => prev.filter(l => l.id !== id));
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('livrables').delete().eq('id', id);
        if (error) throw error;
        addToast('Livrable supprimé.', 'success');
      } catch (err) {
        console.error(err);
        addToast("Erreur lors de la suppression.", 'info');
      }
    } else {
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

  const addUtilisateur = async (user: Omit<Utilisateur, 'id'> & { motDePasse?: string }) => {
    if (isSupabaseConfigured) {
      try {
        if (user.motDePasse) {
          const { createUserAuth } = await import('@/app/actions/createUser');
          const authRes = await createUserAuth(user.email, user.motDePasse, user.nom, user.prenom);
          if (authRes.error) {
             throw new Error(authRes.error);
          }
        }

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
        addToast(`Erreur d'ajout utilisateur: ${err.message}`, 'info');
      }
    } else {
      const newUser: Utilisateur = {
        ...user,
        id: `u${utilisateurs.length + 1}-${Math.random().toString(36).substr(2, 5)}`,
      };
      setUtilisateurs(prev => [...prev, newUser]);
      addToast(`${user.prenom} ${user.nom} ajouté à l'équipe !`, 'success');
    }
  };

  const rolesDisponibles = useMemo(() => {
    return Array.from(new Set([
      ...ROLES_PAR_DEFAUT,
      ...utilisateurs.map(u => u.role),
    ]));
  }, [utilisateurs]);

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <LivrablesContext.Provider value={{ 
      livrables, projets, utilisateurs, addLivrable, updateLivrableStatus, deleteLivrable, isLoading,
      addProjet, addLotToProjet, addPartenaireToProjet, addUtilisateur, rolesDisponibles, currentUser, logout
    }}>
      {children}
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
