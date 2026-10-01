"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

interface UIContextType {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info') => void;
  removeToast: (id: string) => void;
  
  isDrawerOpen: boolean;
  defaultProjetIdForDrawer: string | null;
  defaultLotIdForDrawer: string | null;
  openDrawer: (projetId?: string, lotId?: string) => void;
  closeDrawer: () => void;

  isProjetDrawerOpen: boolean;
  openProjetDrawer: () => void;
  closeProjetDrawer: () => void;

  isUserModalOpen: boolean;
  openUserModal: () => void;
  closeUserModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [defaultProjetIdForDrawer, setDefaultProjetIdForDrawer] = useState<string | null>(null);
  const [defaultLotIdForDrawer, setDefaultLotIdForDrawer] = useState<string | null>(null);

  const [isProjetDrawerOpen, setIsProjetDrawerOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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

  const openProjetDrawer = () => setIsProjetDrawerOpen(true);
  const closeProjetDrawer = () => setIsProjetDrawerOpen(false);

  const openUserModal = () => setIsUserModalOpen(true);
  const closeUserModal = () => setIsUserModalOpen(false);

  return (
    <UIContext.Provider value={{
      toasts, addToast, removeToast,
      isDrawerOpen, defaultProjetIdForDrawer, defaultLotIdForDrawer, openDrawer, closeDrawer,
      isProjetDrawerOpen, openProjetDrawer, closeProjetDrawer,
      isUserModalOpen, openUserModal, closeUserModal
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
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
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
