"use client";

import { useState } from 'react';
import { useLivrables } from '@/context/LivrablesContext';
import { Check, CheckCircle, Eye, MessageSquare, Lock } from 'lucide-react';

export default function ValidationPage() {
  const { livrables, utilisateurs, currentUser, updateLivrableStatus } = useLivrables();
  
  // On ne prend que les livrables en attente de validation
  const pendingLivrables = livrables.filter(l => l.statut === 'en_validation');
  
  // Un admin (par rôle) peut toujours valider, même si l'objet droits est absent/incomplet en base
  const isAdminRole = ['admin_directeur', 'Admin / Directeur'].includes(currentUser?.role || '') ||
    currentUser?.email === 'greenmoundounga@gmail.com';
  const canValidate = currentUser?.droits?.pouvoirValidation === true || isAdminRole;

  const getUserName = (id?: string) => {
    const user = utilisateurs.find(u => u.id === id);
    return user ? `${user.prenom} ${user.nom}` : 'Graphiste';
  };

  const [activeAction, setActiveAction] = useState<{ id: string; type: 'program' | 'correct' } | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleActionClick = (livrable: any, type: 'program' | 'correct') => {
    if (!canValidate) return;
    setActiveAction({ id: livrable.id, type });
    setInputValue(type === 'program' ? (livrable.dateCible ? livrable.dateCible.substring(0, 16) : '') : '');
  };

  const submitAction = (id: string) => {
    if (!activeAction || !canValidate) return;
    if (activeAction.type === 'program') {
      updateLivrableStatus(id, 'programme', undefined, new Date(inputValue).toISOString());
    } else {
      updateLivrableStatus(id, 'a_corriger', inputValue);
    }
    setActiveAction(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-pnpe-dark tracking-tight flex items-center gap-2">
            <CheckCircle size={24} className="text-pnpe-blue" />
            Centre de Validation (BAT)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Examinez et approuvez les contenus avant publication.</p>
        </div>
        <div className="bg-pnpe-amber/10 border border-pnpe-amber/20 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          {pendingLivrables.length > 0 && <span className="w-2 h-2 rounded-full bg-pnpe-amber animate-pulse"></span>}
          {pendingLivrables.length} livrable(s) en attente
        </div>
      </div>

      {!canValidate && pendingLivrables.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-start gap-3">
          <Lock size={20} className="text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Mode Lecture Seule</h3>
            <p className="text-sm">Vous n'avez pas les droits d'approbation. Vous pouvez consulter l'état d'avancement, mais seule la direction peut valider.</p>
          </div>
        </div>
      )}

      {pendingLivrables.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg hairline-border p-10 shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-pnpe-blue" />
          </div>
          <h2 className="text-xl font-bold text-pnpe-dark mb-2">Tout est à jour !</h2>
          <p className="text-gray-500 text-center max-w-md">
            Il n'y a aucun contenu en attente de validation pour le moment. L'équipe de création travaille sûrement sur les prochains livrables.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingLivrables.map(livrable => (
            <div key={livrable.id} className="bg-white rounded-lg hairline-border shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow relative">
              {/* Entête de la carte */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-pnpe-dark leading-tight mb-1">{livrable.titre}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    Par <span className="font-medium text-gray-700">{getUserName(livrable.assigneA)}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase tracking-wider">
                  {livrable.format}
                </span>
              </div>

              {/* Aperçu (Zone grise) */}
              <div className="h-48 bg-gray-100 relative group flex flex-col items-center justify-center border-b border-gray-100 overflow-hidden">
                {livrable.piecesJointes && livrable.piecesJointes.length > 0 ? (
                  <img src={livrable.piecesJointes[0]} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Eye size={32} className="text-gray-300 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-gray-400 font-medium">Aperçu visuel indisponible</span>
                  </>
                )}
                
                {/* Overlay au survol */}
                {livrable.piecesJointes && livrable.piecesJointes.length > 0 && (
                  <div className="absolute inset-0 bg-pnpe-blue/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => window.open(livrable.piecesJointes![0], '_blank')}>
                    <button className="bg-white text-pnpe-dark font-bold px-4 py-2 rounded text-sm shadow-sm flex items-center gap-2">
                      <Eye size={16} /> Ouvrir l'image
                    </button>
                  </div>
                )}
              </div>

              {/* Méta-informations */}
              <div className="p-4 flex-1">
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Brief initial</h4>
                  {livrable.brief?.startsWith('data:image') ? (
                    <img src={livrable.brief} alt={livrable.titre} className="w-full h-32 object-cover rounded-md" />
                  ) : (
                    <p className="text-sm text-gray-600 line-clamp-3">{livrable.brief}</p>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    Cible : <strong className="text-gray-700">{livrable.canaux?.join(', ')}</strong>
                  </span>
                  <span className="text-gray-500">
                    Date : <strong className="text-pnpe-dark">
                      {new Date(livrable.dateCible).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Actions dynamiques - Rôles basés */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 transition-all">
                {!canValidate ? (
                  <div className="text-center text-xs font-bold text-orange-600 bg-orange-100 py-2.5 rounded border border-orange-200">
                    En attente de validation
                  </div>
                ) : activeAction?.id === livrable.id ? (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                    {activeAction.type === 'program' ? (
                      <>
                        <label className="text-xs font-bold text-gray-700">Date et heure de publication</label>
                        <input 
                          type="datetime-local" 
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          className="w-full text-sm p-2 border border-gray-200 rounded focus:ring-pnpe-blue focus:border-pnpe-blue"
                        />
                        <div className="flex gap-2 mt-2">
                          <button disabled={!inputValue} onClick={() => submitAction(livrable.id)} className="flex-1 bg-pnpe-blue text-white font-bold py-2 rounded text-sm disabled:opacity-50">Confirmer</button>
                          <button onClick={() => setActiveAction(null)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded text-sm">Annuler</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="text-xs font-bold text-gray-700">Remarque rapide (correction)</label>
                        <textarea 
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          placeholder="Ex: Le logo n'est pas à la bonne taille..."
                          className="w-full text-sm p-2 border border-gray-200 rounded focus:ring-pnpe-blue focus:border-pnpe-blue resize-none h-20"
                        />
                        <div className="flex gap-2 mt-2">
                          <button disabled={!inputValue} onClick={() => submitAction(livrable.id)} className="flex-1 bg-red-600 text-white font-bold py-2 rounded text-sm disabled:opacity-50">Envoyer</button>
                          <button onClick={() => setActiveAction(null)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded text-sm">Annuler</button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleActionClick(livrable, 'program')}
                      className="flex-1 bg-pnpe-blue hover:bg-pnpe-blue-hover text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Check size={16} />
                      Valider & Programmer
                    </button>
                    <button 
                      onClick={() => handleActionClick(livrable, 'correct')}
                      className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageSquare size={16} />
                      À corriger
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
