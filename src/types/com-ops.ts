export type Role = "admin_directeur" | "redacteur_cm" | "graphiste_video" | "partenaire_externe";

export type FormatLivrable = "Flyer" | "Carrousel" | "Vidéo" | "Communiqué" | "Bâche" | "Offre";
export type Canal = "Facebook" | "LinkedIn" | "TikTok" | "X" | "Presse" | "Affichage";
export type StatutLivrable = "brief" | "conception" | "en_validation" | "programme" | "publie" | "a_corriger";

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Commentaire {
  id: string;
  auteurId: string;
  contenu: string;
  date: string;
}

export interface Livrable {
  id: string;
  titre: string;
  format: FormatLivrable;
  canal: Canal;
  statut: StatutLivrable;
  dateCible: string;
  assigneA?: string; // Utilisateur ID
  validateur?: string; // Utilisateur ID
  projetId?: string; // Optionnel : rattaché à un événement
  brief: string;
  copywriting?: string;
  hashtags?: string[];
  piecesJointes?: string[]; // URLs
  historiqueVersions?: string[]; // URLs
  commentaires: Commentaire[];
}

export interface LotTravail {
  id: string;
  nom: string;
  description: string;
  livrablesId: string[];
}

export interface ProjetEvenement {
  id: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  budget?: number;
  chefDeProjetId: string;
  lotsTravail: LotTravail[];
  membresInternes: string[]; // Utilisateurs ID
  partenairesExternes: string[]; // Utilisateurs ID
  jaugeAvancement: number; // 0 à 100
}
