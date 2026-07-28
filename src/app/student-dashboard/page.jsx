'use client';

import { useState, useEffect } from 'react';
import { 
  Award, 
  CreditCard, 
  Calendar as CalendarIcon, 
  LogOut, 
  Bell,
  CheckCircle2,
  Megaphone
} from 'lucide-react';

export default function StudentDashboard() {
  const [supabase, setSupabase] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [activeTab, setActiveTab] = useState('grades');
  const [loading, setLoading] = useState(true);

  const [myGrades, setMyGrades] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [teachersMap, setTeachersMap] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        setSupabase(client);

        const { data: { user } } = await client.auth.getUser();
        if (user) {
          const { data: prof } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
          setStudentProfile(prof);

          let clsData = null;
          if (prof?.class_id) {
            const { data: cls } = await client.from('classes').select('*').eq('id', prof.class_id).maybeSingle();
            clsData = cls;
            setStudentClass(cls);
          }

          await loadStudentData(client, user.id, prof?.class_id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadStudentData = async (client, studentId, classId) => {
    const { data: gradesData } = await client.from('grades').select('*').eq('student_id', studentId);
    setMyGrades(gradesData || []);

    const { data: paymentsData } = await client.from('payments').select('*').eq('student_id', studentId);
    setMyPayments(paymentsData || []);

    const paidWithNotif = (paymentsData || []).filter(p => p.status === 'paid' && p.notification_sent);
    setNotifications(paidWithNotif);

    if (classId) {
      const { data: schedData } = await client.from('schedules').select('*').eq('class_id', classId);
      setMySchedule(schedData || []);
    }

    const { data: annData } = await client.from('announcements').select('*').order('created_at', { ascending: false });
    if (annData) {
      const filtered = annData.filter(ann => {
        if (ann.target_type === 'all') return true;
        if (ann.target_type === 'class' && ann.target_id === classId) return true;
        if (ann.target_type === 'student' && ann.target_id === studentId) return true;
        return false;
      });
      setMyAnnouncements(filtered);
    }

    const { data: subsData } = await client.from('subjects').select('*');
    if (subsData) {
      const map = {};
      subsData.forEach(s => { map[s.id] = s.name; });
      setSubjectsMap(map);
    }

    const { data: profsData } = await client.from('profiles').select('*');
    if (profsData) {
      const map = {};
      profsData.forEach(p => { map[p.id] = `${p.first_name} ${p.last_name}`; });
      setTeachersMap(map);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.assign('/register');
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = ['08:30 - 10:30', '10:45 - 12:45', '14:00 - 16:00', '16:15 - 18:15'];

  const totalPaid = myPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalAnnual = studentClass?.annual_tuition || 25000;
  const remainingBalance = Math.max(0, totalAnnual - totalPaid);

  if (loading) return <div className="min-h-screen bg-[#edf2f4] text-[#1e3331] flex items-center justify-center text-xs font-bold">Chargement de votre espace...</div>;

  return (
    <div className="min-h-screen bg-[#edf2f4] text-[#1e3331] font-sans flex p-4 gap-4">
      
      {/* SIDEBAR GAUCHE */}
      <aside className="w-72 bg-[#1e3331] text-white rounded-[2rem] p-6 flex flex-col justify-between shadow-xl shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center font-bold text-[#d4af37]">
              {studentProfile?.first_name?.[0]}{studentProfile?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">{studentProfile?.first_name} {studentProfile?.last_name}</h2>
              <p className="text-[10px] text-slate-400">Espace Étudiant</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'grades', label: 'Mes Notes', icon: Award },
              { id: 'payments', label: 'Paiements & Solde', icon: CreditCard },
              { id: 'schedule', label: 'Emploi du temps', icon: CalendarIcon },
              { id: 'announcements', label: 'Annonces & Infos', icon: Megaphone, badge: myAnnouncements.length }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#2b4845] text-white shadow-md border-l-4 border-[#d4af37]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon size={18} className={isActive ? 'text-[#d4af37]' : 'text-slate-400'} />
                    {tab.label}
                  </div>
                  {tab.badge > 0 && (
                    <span className="bg-[#d4af37] text-[#1e3331] text-[10px] font-black px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button 
          onClick={logout} 
          className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
        
        <header className="bg-white rounded-[2rem] px-8 py-5 shadow-sm flex justify-between items-center border border-slate-200/50">
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#1e3331]">
              Tableau de bord Étudiant
            </h1>
            <p className="text-xs text-slate-400">Consultez vos notes, vos échéances financières et vos annonces</p>
          </div>

          {notifications.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-2.5">
              <Bell size={16} className="text-emerald-600 animate-bounce" />
              <div className="text-[11px]">
                <strong className="text-emerald-700 block font-bold">Notification Pro</strong>
                <span className="text-slate-600">Versement validé par l'administration.</span>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 space-y-6">
          
          {activeTab === 'grades' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
              <h2 className="text-sm font-bold text-[#1e3331]">Vos notes obtenues ({myGrades.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myGrades.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6">Aucune note publiée pour le moment.</p>
                ) : (
                  myGrades.map(g => (
                    <div key={g.id} className="bg-[#edf2f4]/60 p-5 rounded-2xl border border-slate-200/40 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#1e3331] uppercase bg-[#1e3331]/10 px-2.5 py-0.5 rounded-full">
                          {subjectsMap[g.subject_id]}
                        </span>
                        <h3 className="text-xs font-bold text-[#1e3331] pt-1">{g.comment || 'Évaluation'}</h3>
                      </div>
                      <span className="text-sm font-black text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                        {g.score} / {g.max_score}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Scolarité Annuelle</p>
                  <p className="text-xl font-black text-[#1e3331] mt-1">{totalAnnual} DH</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Déjà Payé</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">{totalPaid} DH</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Reste à Payer</p>
                  <p className="text-xl font-black text-rose-600 mt-1">{remainingBalance} DH</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
                <h2 className="text-sm font-bold text-[#1e3331]">Détails des Échéances et Inscription (Paiement Physique)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {myPayments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6">Aucun paiement enregistré.</p>
                  ) : (
                    myPayments.map(p => {
                      const isPaid = p.status === 'paid';
                      return (
                        <div 
                          key={p.id} 
                          className={`p-4 rounded-2xl border flex flex-col justify-between text-xs transition-all ${
                            isPaid 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 shadow-sm' 
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-800'
                          }`}
                        >
                          <div>
                            <span className="font-bold uppercase text-[10px] block mb-1">{p.month_label || p.payment_type}</span>
                            <strong className="text-base font-black">{p.amount} DH</strong>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md ${isPaid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                              {isPaid ? 'Payé (Validé)' : 'Impayé'}
                            </span>
                            {isPaid && <CheckCircle2 size={16} className="text-emerald-600" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
              <h2 className="text-sm font-bold text-[#1e3331]">Emploi du temps de votre classe</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400">
                      <th className="p-3 w-32 uppercase text-[10px]">Horaires</th>
                      {daysOfWeek.map(day => <th key={day} className="p-3 uppercase text-[10px]">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timeSlots.map(slot => (
                      <tr key={slot}>
                        <td className="p-3 font-mono text-[11px] text-slate-400 border-r border-slate-100">{slot}</td>
                        {daysOfWeek.map(day => {
                          const matchingSchedule = mySchedule.find(s => s.title?.includes(day) && s.title?.includes(slot));
                          const subName = matchingSchedule ? subjectsMap[matchingSchedule.subject_id] : null;
                          const tchName = matchingSchedule ? teachersMap[matchingSchedule.teacher_id] : null;

                          const colorMatch = matchingSchedule?.title?.match(/color:(#[0-9a-fA-F]{6})/);
                          const cardBgColor = colorMatch ? colorMatch[1] : '#1e3331';

                          return (
                            <td key={day} className="p-2 h-24 align-top border-r border-slate-100 last:border-r-0">
                              {matchingSchedule ? (
                                <div 
                                  className="p-3 rounded-2xl text-white flex flex-col justify-between h-full shadow-sm"
                                  style={{ backgroundColor: cardBgColor }}
                                >
                                  <div>
                                    <p className="font-bold text-xs leading-tight">{subName || 'Cours'}</p>
                                    <p className="text-[10px] opacity-80 mt-1">{tchName || 'N/A'}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400 bg-[#edf2f4]/30">
                                  Libre
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
              <h2 className="text-sm font-bold text-[#1e3331]">Annonces et messages de la direction ({myAnnouncements.length})</h2>
              <div className="space-y-3">
                {myAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6">Aucune annonce ou alerte pour le moment.</p>
                ) : (
                  myAnnouncements.map(ann => (
                    <div key={ann.id} className="p-5 bg-[#edf2f4]/60 rounded-2xl border border-slate-200/40 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-[#1e3331] text-sm flex items-center gap-2">
                          <Megaphone size={14} className="text-[#d4af37]" /> {ann.title}
                        </h3>
                        <span className="text-[10px] uppercase font-bold bg-[#1e3331]/10 text-[#1e3331] px-2.5 py-0.5 rounded-full">
                          {ann.target_type === 'all' ? 'Général' : ann.target_type === 'class' ? 'Pour votre classe' : 'Message personnel'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{ann.message}</p>
                      <p className="text-[10px] text-slate-400 text-right">{new Date(ann.created_at).toLocaleDateString()} à {new Date(ann.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}