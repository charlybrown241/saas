// app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  Phone, 
  Mail, 
  MapPin, 
  Zap,
  ShieldCheck,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [paddle, setPaddle] = useState(null);

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
    }).then((paddleInstance) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, []);

  // Fonction pour le plan Starter (utilise la variable d'environnement ou un ID par défaut)
  const handleCheckoutStarter = () => {
    if (!paddle) return;

    paddle.Checkout.open({
      items: [
        {
          priceId: process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID || '',
          quantity: 1,
        },
      ],
      settings: {
        successUrl: `${window.location.origin}/signup?subscribed=true`,
      },
    });
  };

  // Fonction pour le plan Pro (utilise directement votre ID de prix fourni)
  const handleCheckoutPro = () => {
    if (!paddle) return;

    paddle.Checkout.open({
      items: [
        {
          priceId: 'pri_01kymbpt28ppymjvmvs5kk3q3z',
          quantity: 1,
        },
      ],
      settings: {
        successUrl: `${window.location.origin}/signup?subscribed=true`,
      },
    });
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Comment inscrire notre établissement ?",
      r: "Rien de plus simple : clique sur 'Commencer', règle ton abonnement et configure ton espace universitaire en quelques secondes pour piloter tes départements immédiatement."
    },
    {
      q: "Puis-je faire évoluer les forfaits selon nos départements ?",
      r: "Totalement ! Tu peux ajuster ton abonnement ou ajouter des options académiques en un seul clic directement depuis ton tableau de bord."
    },
    {
      q: "Les données des étudiants et des notes sont-elles en sécurité ?",
      r: "Absolument. Tout est hébergé et sécurisé via Supabase avec un chiffrement haut niveau pour garantir la stricte confidentialité des dossiers universitaires."
    },
    {
      q: "Y a-t-il des engagements de durée pour l'université ?",
      r: "Aucun. Tous nos abonnements sont totalement libres : tu adaptes ou tu interromps ton abonnement quand tu le souhaites, sans prise de tête."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-[#163a24] selection:text-white">
      
      {/* 0. TOP BAR */}
      <div className="bg-[#163a24] text-white text-[11px] py-2 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Phone size={13} className="text-[#a3e635]" /> +212 (0) 5 00 00 00 00</span>
            <span className="flex items-center gap-1.5"><Mail size={13} className="text-[#a3e635]" /> contact@univision.com</span>
            <span className="flex items-center gap-1.5 hidden md:flex"><MapPin size={13} className="text-[#a3e635]" /> Casablanca, Maroc</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-[10px] font-medium tracking-wide uppercase">
            <span className="bg-[#a3e635]/20 text-[#a3e635] px-2 py-0.5 rounded-full">Campus v2.4 Live</span>
          </div>
        </div>
      </div>

      {/* 1. NAVIGATION PRINCIPALE */}
      <header className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#163a24] text-[#a3e635] flex items-center justify-center font-black text-sm">
            UN
          </div>
          <span className="font-extrabold tracking-tight text-sm uppercase">Univision</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-700">
          <a href="#" className="text-[#163a24]">Accueil</a>
          <a href="#features" className="hover:text-[#163a24] transition-colors">Fonctionnalités</a>
          <a href="#workflow" className="hover:text-[#163a24] transition-colors">Le Campus</a>
          <a href="#pricing" className="hover:text-[#163a24] transition-colors">Tarifs</a>
          <a href="#faq" className="hover:text-[#163a24] transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/register" className="text-xs font-semibold text-slate-700 hover:text-[#163a24] px-3 py-2 transition-colors">
            Connexion
          </Link>
          <a href="#pricing" className="text-xs font-semibold text-white bg-[#163a24] hover:bg-[#112d1b] px-5 py-2.5 rounded-full transition-all shadow-sm">
            Commencer
          </a>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#163a24]">
            <Sparkles size={14} className="text-[#163a24]" />
            Pensé pour simplifier la gestion universitaire
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#111827] leading-[1.1]">
            Pilote ton université <br />
            et orchestre ton campus <br />
            <span className="text-[#163a24]">en toute simplicité</span>
          </h1>
          
          <p className="text-xs md:text-sm text-slate-500 max-w-md leading-relaxed">
            Fini les tâches administratives lourdes et les outils dispersés. Univision rassemble les inscriptions, les cursus et le suivi des étudiants en un seul endroit chaleureux et fluide.
          </p>

          <div className="pt-2 flex items-center gap-4">
            <a
              href="#pricing"
              className="h-11 px-6 rounded-full text-xs font-semibold text-white bg-[#163a24] hover:bg-[#112d1b] transition-all shadow-md flex items-center gap-2"
            >
              Tester gratuitement <ArrowRight size={14} className="text-[#a3e635]" />
            </a>
            <a
              href="#features"
              className="text-xs font-semibold text-slate-700 hover:text-[#163a24] transition-colors px-4 py-2"
            >
              Voir les modules
            </a>
          </div>
        </div>

        {/* Aperçu / Mockup Dashboard */}
        <div className="relative flex justify-center">
          <div className="w-full max-w-md bg-[#111827] rounded-2xl p-4 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">app.univision.com/dashboard</span>
            </div>
            <div className="space-y-3 py-2">
              <div className="bg-[#163a24]/30 border border-[#163a24] p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">État du campus</div>
                  <div className="text-sm font-bold text-white mt-0.5">Inscriptions fluides 🚀</div>
                </div>
                <BarChart3 className="text-[#a3e635]" size={20} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Étudiants actifs</div>
                  <div className="text-xs font-bold text-white mt-1">100% synchronisés</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Disponibilité</div>
                  <div className="text-xs font-bold text-[#a3e635] mt-1">Portail en ligne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee / Barre de fonctionnalités clés */}
      <div className="bg-[#163a24] text-white py-4 overflow-hidden whitespace-nowrap">
        <div className="inline-flex gap-12 text-xs font-bold tracking-wider uppercase text-[#a3e635]">
          <span>⚡ Gestion des cursus simplifiée</span>
          <span>🔒 Sécurité des dossiers étudiants</span>
          <span>📊 Suivi académique en temps réel</span>
          <span>🚀 Portail prêt en un clin d'œil</span>
          <span>💡 Pensé pour la communauté universitaire</span>
        </div>
      </div>

      {/* 3. ABOUT / SECTION VALEUR AJOUTÉE */}
      <section id="workflow" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 h-64 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-6 bg-[#f8fafc] border border-slate-200">
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#163a24] text-[#a3e635] flex items-center justify-center mx-auto">
                  <Zap size={24} />
                </div>
                <div className="text-xs font-bold text-slate-800">Zéro friction</div>
                <p className="text-[11px] text-slate-500">Une interface intuitive pour les étudiants et l'administration.</p>
              </div>
            </div>
            <div className="bg-slate-100 h-64 rounded-2xl overflow-hidden shadow-sm pt-6 flex items-center justify-center p-6 bg-[#f8fafc] border border-slate-200">
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#163a24] text-[#a3e635] flex items-center justify-center mx-auto">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-xs font-bold text-slate-800">Tranquillité d'esprit</div>
                <p className="text-[11px] text-slate-500">Notes et données académiques protégées en permanence.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full text-xs font-medium text-[#163a24]">
              <span className="w-2 h-2 rounded-full bg-[#a3e635]"></span>
              Pourquoi ton université va adorer l'utiliser
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#111827]">
              Conçu pour fluidifier la vie de ton campus au quotidien
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              On a voulu créer l'outil idéal pour les facultés : simple, efficace, sans lourdeur administrative, pour que chacun puisse se consacrer pleinement à la réussite pédagogique.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Confort de gestion administrative</span>
                  <span>98%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#163a24] h-full rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Gain de temps pour le secrétariat</span>
                  <span>95%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#163a24] h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Satisfaction des étudiants</span>
                  <span>99%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#163a24] h-full rounded-full" style={{ width: '99%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a href="#pricing" className="inline-flex items-center gap-2 bg-[#163a24] text-white px-6 py-3 rounded-full text-xs font-semibold hover:bg-[#112d1b] transition-all">
                Déployer sur le campus <ArrowRight size={14} className="text-[#a3e635]" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-12 border-t border-slate-100 text-center">
          <div>
            <div className="text-3xl font-black text-[#111827]">15k+</div>
            <div className="text-xs text-slate-500 mt-1">Étudiants connectés</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#111827]">99.9%</div>
            <div className="text-xs text-slate-500 mt-1">Portail toujours en ligne</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#111827]">24/7</div>
            <div className="text-xs text-slate-500 mt-1">Support universitaire</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#111827]">5M+</div>
            <div className="text-xs text-slate-500 mt-1">Requêtes académiques gérées</div>
          </div>
        </div>
      </section>

      {/* 4. SECTION FONCTIONNALITÉS */}
      <section id="features" className="bg-[#163a24] text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-[#a3e635]">
                <span className="w-2 h-2 rounded-full bg-[#a3e635]"></span>
                Modules & Outils pédagogiques
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Tout ce qu'il faut pour <br />piloter ton université
              </h2>
            </div>
            <a href="#pricing" className="mt-4 md:mt-0 text-xs font-semibold bg-white text-[#163a24] hover:bg-slate-100 px-5 py-2.5 rounded-full transition-all flex items-center gap-2">
              Explorer les modules <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#112d1b] p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#163a24] text-[#a3e635] flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Suivi des notes et bulletins</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Centralise l'évaluation des étudiants et l'édition des relevés de notes en quelques clics.
                </p>
              </div>
            </div>

            <div className="bg-[#a3e635] text-[#111827] p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-[#163a24]/10 px-2.5 py-1 rounded-full inline-block">Essentiel campus</span>
                <h3 className="text-lg font-black">Gestion des inscriptions</h3>
                <p className="text-xs text-slate-800 leading-relaxed">
                  Automatise l'accueil des nouveaux arrivants et la répartition des promotions sans effort.
                </p>
              </div>
              <a href="#pricing" className="inline-flex items-center gap-1 text-xs font-bold text-[#163a24] hover:underline">
                En savoir plus <ArrowRight size={14} />
              </a>
            </div>

            <div className="bg-[#112d1b] p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#163a24] text-[#a3e635] flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <h3 className="text-base font-bold text-white">Portail professeurs & étudiants</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Chacun dispose de son espace dédié pour consulter les emplois du temps et partager les ressources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION TARIFS */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full text-xs font-medium text-[#163a24] mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#a3e635]"></span>
            Tarification transparente
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Des prix justes pour chaque structure</h2>
          <p className="text-xs text-slate-500">Sans engagement. Modulable selon la taille de ton établissement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Plan Starter */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starter Campus</span>
                <div className="text-3xl font-black text-[#111827] mt-1">
                  5$ <span className="text-xs font-normal text-slate-500">/ mois</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">Idéal pour démarrer la numérisation d'une petite filière ou école.</p>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#163a24]" /> Accès au dashboard principal</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#163a24]" /> Jusqu'à 3 administrateurs</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#163a24]" /> Support amical par email</li>
              </ul>
            </div>
            <button 
              onClick={handleCheckoutStarter}
              disabled={!paddle}
              className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-[#111827] text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400"
            >
              {paddle ? 'Choisir Starter' : 'Chargement...'}
            </button>
          </div>

          {/* Plan Pro */}
          <div className="bg-[#163a24] text-white p-8 rounded-2xl shadow-md flex flex-col justify-between space-y-6 relative">
            <div className="absolute top-4 right-4 bg-[#a3e635] text-[#163a24] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Recommandé
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pro Université</span>
                <div className="text-3xl font-black text-white mt-1">
                  10$ <span className="text-xs font-normal text-slate-300">/ mois</span>
                </div>
              </div>
              <p className="text-xs text-slate-200">Pour une gestion globale sans limites et un accompagnement prioritaire.</p>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#a3e635]" /> Tout ce qu'inclut le Starter</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#a3e635]" /> Comptes administrateurs illimités</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#a3e635]" /> Rapports et exports académiques</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#a3e635]" /> Support prioritaire 24/7</li>
              </ul>
            </div>
            <button 
              onClick={handleCheckoutPro}
              disabled={!paddle}
              className="w-full h-11 bg-[#a3e635] hover:bg-[#bef264] text-[#163a24] text-xs font-bold rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:bg-gray-400 disabled:text-gray-200"
            >
              {paddle ? 'Choisir Pro' : 'Chargement...'}
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold tracking-tight">On répond à tes questions</h2>
          <p className="text-xs text-slate-500">Tout ce que tu aimerais savoir avant d'implanter Univision.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 focus:outline-none"
              >
                <span className="text-xs md:text-sm font-semibold text-slate-900">{faq.q}</span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.r}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#111827] text-white py-12 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#163a24] text-[#a3e635] flex items-center justify-center font-bold text-xs">
              UN
            </div>
            <span className="font-extrabold tracking-tight text-white uppercase">Univision</span>
          </div>
          <p>© 2026 Univision. Fait avec passion pour l'éducation.</p>
          <div className="flex gap-6 text-slate-300">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions générales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}