"use client";

import { useState } from 'react';
import { X, UserPlus, Upload, CheckCircle, Lock } from 'lucide-react';
import { useLivrables } from '@/context/LivrablesContext';
import { useUI } from '@/context/UIContext';

export function AddUserModal() {
  const { addUtilisateur, rolesDisponibles, projets } = useLivrables();
  const { isUserModalOpen, closeUserModal } = useUI();
  
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('');
  const [depotContenu, setDepotContenu] = useState(true);
  const [pouvoirValidation, setPouvoirValidation] = useState(false);
  const [accesLimite, setAccesLimite] = useState(false);
  const [projetLimiteId, setProjetLimiteId] = useState('');

  if (!isUserModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!nomComplet || !email || !motDePasse || !role) return;

    // Séparer nom et prénom
    const parts = nomComplet.trim().split(' ');
    const prenom = parts[0] || '';
    const nom = parts.slice(1).join(' ') || prenom;

    addUtilisateur({
      nom,
      prenom,
      email,
      motDePasse,
      role,
      droits: {
        depotContenu,
        pouvoirValidation,
        accesLimite,
      },
      projetLimiteId: accesLimite ? projetLimiteId || undefined : undefined,
    });

    // Reset
    setNomComplet('');
    setEmail('');
    setMotDePasse('');
    setRole('');
    setDepotContenu(true);
    setPouvoirValidation(false);
    setAccesLimite(false);
    setProjetLimiteId('');
  };

  return (
    <div className="fixed inset-0 bg-pnpe-blue/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <h2 className="font-bold text-pnpe-dark flex items-center gap-2">
            <UserPlus size={18} />
            Ajouter un collaborateur
          </h2>
          <button type="button" onClick={closeUserModal} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Nom complet */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={nomComplet}
              onChange={e => setNomComplet(e.target.value)}
              placeholder="Ex: Jean-Paul Mbolo"
              className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jean-paul@pnpe.ga"
              className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue"
              required
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe initial</label>
            <input
              type="text"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              placeholder="Ex: MotDePasse@123"
              className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue"
              required
            />
          </div>

          {/* Rôle / Catégorie avec datalist */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rôle / Catégorie</label>
            <input
              type="text"
              list="roles-list"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Sélectionnez ou tapez un nouveau rôle..."
              className="w-full text-sm p-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue"
              required
            />
            <datalist id="roles-list">
              {rolesDisponibles.map(r => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <p className="text-[10px] text-gray-400 mt-1">
              Choisissez un rôle existant ou tapez un nouveau (ex: &quot;Monteur Vidéo&quot;, &quot;Chargé RP&quot;).
            </p>
          </div>

          {/* Droits */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-3">Attribution des droits</label>
            <div className="space-y-3">
              {/* Dépôt de contenus */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={depotContenu}
                  onChange={e => setDepotContenu(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-pnpe-blue focus:ring-pnpe-blue accent-pnpe-blue"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Upload size={14} className="text-pnpe-blue" />
                    <span className="text-sm font-medium text-gray-800">Dépôt de contenus</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Peut importer des visuels et rédiger des textes.</p>
                </div>
              </label>

              {/* Pouvoir de validation */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={pouvoirValidation}
                  onChange={e => setPouvoirValidation(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-pnpe-blue focus:ring-pnpe-blue accent-pnpe-blue"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-800">Pouvoir de validation</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Peut approuver, refuser et programmer les posts.</p>
                </div>
              </label>

              {/* Accès limité */}
              <div>
                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={accesLimite}
                    onChange={e => setAccesLimite(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-pnpe-blue focus:ring-pnpe-blue accent-pnpe-blue"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-pnpe-amber" />
                      <span className="text-sm font-medium text-gray-800">Accès limité à un projet</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Cloisonnement pour les invités externes.</p>
                  </div>
                </label>

                {accesLimite && (
                  <div className="mt-2 ml-10">
                    <select
                      value={projetLimiteId}
                      onChange={e => setProjetLimiteId(e.target.value)}
                      className="w-full text-sm p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-pnpe-blue focus:border-pnpe-blue bg-white"
                    >
                      <option value="">Sélectionner un projet...</option>
                      {projets.map(p => (
                        <option key={p.id} value={p.id}>{p.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleSubmit}
            type="button"
            disabled={!nomComplet || !email || !motDePasse || !role}
            className="w-full bg-pnpe-blue hover:bg-pnpe-blue-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            Ajouter le collaborateur
          </button>
        </div>
      </div>
    </div>
  );
}
