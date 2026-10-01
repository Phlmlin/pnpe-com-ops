"use client";

import { Users, Mail, Shield, Plus, X, UserPlus } from 'lucide-react';
import { ProjetEvenement } from '@/types/com-ops';
import { useLivrables } from '@/context/LivrablesContext';
import { useState } from 'react';

const getRoleBadgeColor = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes('admin') || r.includes('directeur')) return 'bg-pnpe-blue/10 text-pnpe-dark border-pnpe-blue/20';
  if (r.includes('graphiste') || r.includes('vidéo') || r.includes('monteur')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (r.includes('rédacteur') || r.includes('cm') || r.includes('chargé')) return 'bg-green-50 text-green-700 border-green-200';
  if (r.includes('partenaire') || r.includes('externe')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

export function EventPartners({ projet }: { projet: ProjetEvenement }) {
  const { utilisateurs, addPartenaireToProjet, openUserModal, currentUser } = useLivrables();
  const partenaires = utilisateurs.filter(u => projet.partenairesExternes.includes(u.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    addPartenaireToProjet(projet.id, selectedUser);
    setIsModalOpen(false);
    setSelectedUser('');
  };

  return (
    <div className="bg-white rounded-lg hairline-border shadow-sm h-full flex flex-col relative">
      <div className="p-4 hairline-border-b flex justify-between items-center bg-gray-50/50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-pnpe-dark uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          Partenaires & Invités
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-pnpe-blue hover:bg-pnpe-blue/10 p-1 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-4 bg-blue-50/50 border border-blue-100 p-3 rounded-md flex items-start gap-3">
          <Shield size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">Les invités externes ont un accès <strong>restreint en lecture/validation</strong> uniquement sur les lots de cet événement.</p>
        </div>

        <div className="space-y-3">
          {partenaires.map(partenaire => (
            <div key={partenaire.id} className="flex items-center justify-between p-2 hairline-border rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {partenaire.prenom.charAt(0)}{partenaire.nom.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-pnpe-dark leading-tight">{partenaire.prenom} {partenaire.nom}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(partenaire.role)}`}>
                      {partenaire.role}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-pnpe-dark transition-colors">
                <Mail size={14} />
              </button>
            </div>
          ))}
          
          {partenaires.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Aucun partenaire externe invité.</p>
          )}
        </div>
      </div>
      
      <div className="p-3 hairline-border-t bg-gray-50 rounded-b-lg">
        <button className="w-full text-xs font-medium text-pnpe-dark hover:underline text-center">
          Voir le journal d'audit des accès
        </button>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center p-4 rounded-lg animate-in fade-in">
          <form onSubmit={handleAdd} className="bg-white border border-gray-200 shadow-xl rounded-lg p-5 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-pnpe-dark text-sm">Inviter un partenaire</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sélectionner un utilisateur</label>
                <select 
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  className="w-full text-sm p-2 border border-gray-200 rounded focus:outline-none focus:border-pnpe-blue"
                  required
                >
                  <option value="">Choisir...</option>
                  {utilisateurs.filter(u => !u.role.toLowerCase().includes('admin') && !projet.partenairesExternes.includes(u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.role})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-pnpe-blue hover:bg-pnpe-blue-hover text-white font-bold py-2 rounded text-sm transition-colors">
                Ajouter à l'événement
              </button>

              {(currentUser?.role === 'admin_directeur' || currentUser?.role === 'Chef de Service') && (
                <div className="hairline-border-t pt-3">
                  <button 
                    type="button"
                    onClick={() => { setIsModalOpen(false); openUserModal(); }}
                    className="w-full flex items-center justify-center gap-2 text-xs text-pnpe-dark hover:underline font-medium"
                  >
                    <UserPlus size={14} />
                    Créer un nouveau collaborateur
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

