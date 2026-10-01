'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { login } from './actions';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-white">
      {/* Panneau gauche : Branding (masqué sur petits écrans) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-gradient-to-br from-[#0A2540] to-[#005BAC] relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Motifs décoratifs d'arrière-plan */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white blur-[120px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-white blur-[100px]"></div>
        </div>

        {/* Top Left: Logo / Brand */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-auto bg-white p-2 rounded-xl shadow-md flex items-center justify-center">
            <img src="/logo-pnpe.png" alt="PNPE Logo" className="h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PNPE</h1>
            <p className="text-sm font-medium text-blue-200">Cellule Communication</p>
          </div>
        </div>

        {/* Center: Hero Text */}
        <div className="relative z-10 max-w-lg mt-8">
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Pôle National de Promotion de l'Emploi
          </h2>
          <p className="text-lg text-blue-100/80 leading-relaxed font-light">
            Plateforme intégrée de gestion opérationnelle, éditoriale et de diffusion pour la Cellule Communication et ses partenaires.
          </p>
        </div>

        {/* Bottom Left: Footer */}
        <div className="relative z-10 text-xs text-blue-300/60 font-medium">
          © 2026 PNPE — République Gabonaise. Tous droits réservés.
        </div>
      </div>

      {/* Panneau droit : Formulaire */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative bg-gray-50/30">
        
        {/* Logo Mobile Uniquement */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="h-10 w-10 bg-pnpe-blue rounded-lg shadow-sm flex items-center justify-center">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-pnpe-blue">PNPE</h1>
            <p className="text-xs text-gray-500 font-medium">Cellule Communication</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Connexion</h3>
            <p className="text-gray-500 font-medium text-sm">Accédez à votre espace de travail Com</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Message d'erreur */}
            {errorMsg && (
              <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <Lock size={16} className="text-red-500 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Identifiant
              </label>
              <div className="relative rounded-lg shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-pnpe-blue transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pnpe-blue/20 focus:border-pnpe-blue sm:text-sm bg-white hover:bg-gray-50 focus:bg-white transition-all shadow-sm"
                  placeholder="agent@pnpe.ga"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative rounded-lg shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-pnpe-blue transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pnpe-blue/20 focus:border-pnpe-blue sm:text-sm bg-white hover:bg-gray-50 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-pnpe-blue focus:ring-pnpe-blue border-gray-300 rounded cursor-pointer transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-pnpe-blue hover:text-pnpe-blue/80 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-pnpe-blue hover:bg-pnpe-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pnpe-blue transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connexion sécurisée...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Accès réservé au personnel autorisé de la Cellule Communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
