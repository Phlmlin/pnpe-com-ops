-- Active: Supabase SQL Editor
-- Script d'initialisation pour PNPE Com-Ops

-- 1. Table Utilisateurs
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin_directeur', 'redacteur_cm', 'graphiste_video', 'partenaire_externe')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Projets (Événements)
CREATE TABLE projets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  lieu TEXT,
  budget INTEGER,
  chef_de_projet_id UUID REFERENCES utilisateurs(id),
  jauge_avancement INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des membres internes des projets
CREATE TABLE projet_membres_internes (
  projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  PRIMARY KEY (projet_id, utilisateur_id)
);

-- 4. Table des partenaires externes des projets
CREATE TABLE projet_partenaires_externes (
  projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  PRIMARY KEY (projet_id, utilisateur_id)
);

-- 5. Table Lots de travail
CREATE TABLE lots_travail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table Livrables
CREATE TABLE livrables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('Flyer', 'Carrousel', 'Vidéo', 'Communiqué', 'Bâche')),
  canal TEXT NOT NULL CHECK (canal IN ('Facebook', 'LinkedIn', 'TikTok', 'X', 'Presse', 'Affichage')),
  statut TEXT NOT NULL CHECK (statut IN ('brief', 'conception', 'en_validation', 'programme', 'publie')),
  date_cible TIMESTAMP WITH TIME ZONE NOT NULL,
  assigne_a UUID REFERENCES utilisateurs(id),
  validateur UUID REFERENCES utilisateurs(id),
  projet_id UUID REFERENCES projets(id),
  lot_id UUID REFERENCES lots_travail(id),
  brief TEXT,
  copywriting TEXT,
  hashtags TEXT[],
  pieces_jointes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table Commentaires
CREATE TABLE commentaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livrable_id UUID REFERENCES livrables(id) ON DELETE CASCADE,
  auteur_id UUID REFERENCES utilisateurs(id),
  contenu TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security (RLS) - Basic (Public access for demo)
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projet_membres_internes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projet_partenaires_externes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots_travail ENABLE ROW LEVEL SECURITY;
ALTER TABLE livrables ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture et l'écriture pour tout le monde (pour la phase de DEV)
CREATE POLICY "Public Access" ON utilisateurs FOR ALL USING (true);
CREATE POLICY "Public Access" ON projets FOR ALL USING (true);
CREATE POLICY "Public Access" ON projet_membres_internes FOR ALL USING (true);
CREATE POLICY "Public Access" ON projet_partenaires_externes FOR ALL USING (true);
CREATE POLICY "Public Access" ON lots_travail FOR ALL USING (true);
CREATE POLICY "Public Access" ON livrables FOR ALL USING (true);
CREATE POLICY "Public Access" ON commentaires FOR ALL USING (true);

-- Insertion de données de démonstration de base
INSERT INTO utilisateurs (id, nom, prenom, email, role, avatar_url) VALUES 
('11111111-1111-1111-1111-111111111111', 'Mba', 'Jean-Claude', 'jc.mba@pnpe.ga', 'admin_directeur', 'https://ui-avatars.com/api/?name=Jean-Claude+Mba&background=0B192C&color=fff'),
('22222222-2222-2222-2222-222222222222', 'Ndong', 'Sarah', 's.ndong@pnpe.ga', 'redacteur_cm', 'https://ui-avatars.com/api/?name=Sarah+Ndong&background=00875A&color=fff'),
('33333333-3333-3333-3333-333333333333', 'Koumba', 'Marc', 'm.koumba@pnpe.ga', 'graphiste_video', 'https://ui-avatars.com/api/?name=Marc+Koumba&background=D97706&color=fff'),
('44444444-4444-4444-4444-444444444444', 'Ondo', 'Pauline', 'p.ondo@partenaire.ga', 'partenaire_externe', null);
