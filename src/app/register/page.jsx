'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [supabase, setSupabase] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initSupabase = async () => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        setSupabase(client);
      } catch (e) {
        console.error("Erreur init Supabase client", e);
      }
    };
    initSupabase();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Initialisation du service en cours... Veuillez réessayer.");
      setLoading(false);
      return;
    }

    try {
      const { data: signInData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw new Error("Adresse email ou mot de passe incorrect.");

      // Récupération stricte du rôle pour l'aiguillage
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .maybeSingle();

      if (profError) {
        console.warn("Erreur de lecture du profil:", profError.message);
      }

      const userRole = prof?.role || 'student';
      if (userRole === 'admin') {
        window.location.assign('/admin-dashboard');
      } else if (userRole === 'teacher') {
        window.location.assign('/teacher-dashboard');
      } else {
        window.location.assign('/student-dashboard');
      }

    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#edf2f4] px-4 text-[#1e3331] font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-200/60 space-y-6">
        
        {/* En-tête */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#1e3331] text-[#d4af37] rounded-2xl mx-auto flex items-center justify-center shadow-lg font-black text-lg border border-[#d4af37]/30">
            CRM
          </div>
          <h2 className="text-xl font-black text-[#1e3331] tracking-tight">
            Connexion CRM Scolaire
          </h2>
          <p className="text-xs text-slate-400">
            Accédez à votre espace (Admin, Professeur ou Étudiant)
          </p>
        </div>

        {/* Formulaire */}
        <form className="space-y-4" onSubmit={handleLogin} autoComplete="off">
          {error && (
            <div className="bg-rose-500/10 text-rose-500 p-3.5 rounded-2xl text-xs border border-rose-500/20 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Adresse Email</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@ecole.com"
                autoComplete="new-email"
                name="no-autofill-email"
                className="w-full pl-11 pr-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-[#1e3331] text-xs focus:outline-none focus:ring-2 focus:ring-[#1e3331]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Mot de passe</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                name="no-autofill-password"
                className="w-full pl-11 pr-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-[#1e3331] text-xs focus:outline-none focus:ring-2 focus:ring-[#1e3331]/20 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-[#1e3331] hover:bg-[#2b4845] transition-all disabled:opacity-50 shadow-lg shadow-[#1e3331]/20 flex items-center justify-center gap-2"
            >
              <LogIn size={16} className="text-[#d4af37]" />
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}