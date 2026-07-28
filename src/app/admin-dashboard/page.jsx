'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Users, 
  CreditCard, 
  Bell,
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Check,
  X,
  Eye,
  Send,
  Edit2
} from 'lucide-react';

export default function AdminDashboard() {
  const [supabase, setSupabase] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Gestion de la fiche modale de l'étudiant sélectionné
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // --- ÉTATS POUR LA MODIFICATION D'UNE CLASSE ---
  const [editingClass, setEditingClass] = useState(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassDesc, setEditClassDesc] = useState('');
  const [editClassTuition, setEditClassTuition] = useState('');
  const [editClassDuration, setEditClassDuration] = useState('');

  // --- ÉTATS POUR LA MODIFICATION D'UNE MATIÈRE ---
  const [editingSubject, setEditingSubject] = useState(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubClassId, setEditSubClassId] = useState('');
  const [editSubTeacherId, setEditSubTeacherId] = useState('');

  // État pour la modification d'un utilisateur
  const [editingUser, setEditingUser] = useState(null);
  const [editUserFirstName, setEditUserFirstName] = useState('');
  const [editUserLastName, setEditUserLastName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('student');
  const [editUserClassId, setEditUserClassId] = useState('');

  // Formulaires Classes & Paramètres de scolarité
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassTuition, setNewClassTuition] = useState('25000');
  const [newClassDuration, setNewClassDuration] = useState('10');

  const [newSubName, setNewSubName] = useState('');
  const [newSubClassId, setNewSubClassId] = useState('');
  const [newSubTeacherId, setNewSubTeacherId] = useState('');

  // Formulaire Planning Grille Personnalisée
  const [schedClassId, setSchedClassId] = useState('');
  const [schedSubjectId, setSchedSubjectId] = useState('');
  const [schedTeacherId, setSchedTeacherId] = useState('');
  const [schedDay, setSchedDay] = useState('Lundi');
  const [schedTimeSlot, setSchedTimeSlot] = useState('08:30 - 10:30');
  const [schedColor, setSchedColor] = useState('#1e3331');

  const colorPalette = [
    { label: 'Vert Forêt', value: '#1e3331' },
    { label: 'Doré / Moutarde', value: '#d4af37' },
    { label: 'Bleu Profond', value: '#2563eb' },
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Pourpre', value: '#7c3aed' }
  ];

  // Formulaire Utilisateur
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserClassId, setNewUserClassId] = useState('');

  // Formulaire Annonce / Alerte
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTargetType, setAnnTargetType] = useState('all'); // 'all', 'class', 'student'
  const [annTargetId, setAnnTargetId] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        setSupabase(client);
        loadData(client);
      } catch (e) {
        console.error("Erreur init Supabase", e);
      }
    };
    init();
  }, []);

  const loadData = async (client) => {
    setLoading(true);
    try {
      const { data: clsData } = await client.from('classes').select('*').order('created_at', { ascending: false });
      setClasses(clsData || []);
      if (clsData?.length > 0 && !schedClassId) {
        setSchedClassId(clsData[0].id);
      }

      const { data: profData } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      setProfiles(profData || []);

      const { data: subData } = await client.from('subjects').select('*').order('created_at', { ascending: false });
      setSubjects(subData || []);

      const { data: payData } = await client.from('payments').select('*').order('created_at', { ascending: false });
      setPayments(payData || []);

      const { data: schData } = await client.from('schedules').select('*').order('created_at', { ascending: true });
      setSchedules(schData || []);

      const { data: annData } = await client.from('announcements').select('*').order('created_at', { ascending: false });
      setAnnouncements(annData || []);
    } catch (err) {
      console.warn("Table announcements potentiellement absente ou erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const { error } = await supabase.from('classes').insert([{ 
        name: newClassName, 
        description: newClassDesc,
        annual_tuition: parseFloat(newClassTuition) || 25000,
        duration_months: parseInt(newClassDuration) || 10
      }]);
      if (error) throw error;
      setNewClassName(''); setNewClassDesc('');
      setSuccess("Classe et structure tarifaire créées avec succès !");
      loadData(supabase);
    } catch (err) { setError(err.message); }
  };

  // --- GESTION MODIFICATION / SUPPRESSION CLASSES ---
  const handleOpenEditClass = (cls) => {
    setEditingClass(cls);
    setEditClassName(cls.name || '');
    setEditClassDesc(cls.description || '');
    setEditClassTuition(cls.annual_tuition || '');
    setEditClassDuration(cls.duration_months || '');
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: editClassName,
          description: editClassDesc,
          annual_tuition: parseFloat(editClassTuition) || 25000,
          duration_months: parseInt(editClassDuration) || 10
        })
        .eq('id', editingClass.id);

      if (error) throw error;
      setSuccess("Classe mise à jour avec succès !");
      setEditingClass(null);
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', classId);
      if (error) throw error;
      setSuccess("Classe supprimée avec succès.");
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubName || !newSubClassId) return;
    try {
      const { error } = await supabase.from('subjects').insert([{ name: newSubName, class_id: newSubClassId, teacher_id: newSubTeacherId || null }]);
      if (error) throw error;
      setNewSubName('');
      setSuccess("Matière créée avec succès !");
      loadData(supabase);
    } catch (err) { setError(err.message); }
  };

  // --- GESTION MODIFICATION / SUPPRESSION MATIÈRES ---
  const handleOpenEditSubject = (sub) => {
    setEditingSubject(sub);
    setEditSubName(sub.name || '');
    setEditSubClassId(sub.class_id || '');
    setEditSubTeacherId(sub.teacher_id || '');
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      const { error } = await supabase
        .from('subjects')
        .update({
          name: editSubName,
          class_id: editSubClassId,
          teacher_id: editSubTeacherId || null
        })
        .eq('id', editingSubject.id);

      if (error) throw error;
      setSuccess("Matière mise à jour avec succès !");
      setEditingSubject(null);
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) return;
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
      if (error) throw error;
      setSuccess("Matière supprimée avec succès.");
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!schedClassId || !schedSubjectId) return;

    try {
      const nowIso = new Date().toISOString();
      const payload = {
        class_id: schedClassId,
        subject_id: schedSubjectId,
        teacher_id: schedTeacherId || null,
        title: `${schedDay} | ${schedTimeSlot} | color:${schedColor}`,
        start_time: nowIso,
        end_time: nowIso
      };

      const { error } = await supabase.from('schedules').insert([payload]);
      if (error) throw error;

      setSuccess("Cours planifié avec succès !");
      loadData(supabase);
    } catch (err) { setError(err.message); }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      setSuccess("Créneau supprimé.");
      loadData(supabase);
    } catch (err) { setError(err.message); }
  };

  const handleDeleteAttendanceReport = async (id) => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      setSuccess("Feuille de présence supprimée avec succès.");
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setSuccess("Utilisateur supprimé avec succès.");
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditUserFirstName(user.first_name || '');
    setEditUserLastName(user.last_name || '');
    setEditUserEmail(user.email || '');
    setEditUserRole(user.role || 'student');
    setEditUserClassId(user.class_id || '');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editUserFirstName,
          last_name: editUserLastName,
          email: editUserEmail,
          role: editUserRole,
          class_id: editUserRole === 'student' ? (editUserClassId || null) : null
        })
        .eq('id', editingUser.id);

      if (error) throw error;
      setSuccess("Utilisateur mis à jour avec succès !");
      setEditingUser(null);
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleValidatePayment = async (paymentId) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString(), notification_sent: true })
        .eq('id', paymentId);

      if (error) throw error;
      setSuccess("Paiement validé avec succès ! L'échéance est réglée.");
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGeneratePaymentsForStudent = async (studentId) => {
    if (!studentId) return;
    try {
      const student = profiles.find(p => p.id === studentId);
      if (!student || !student.class_id) {
        setError("Cet étudiant n'est assigné à aucune classe.");
        return;
      }

      const cls = classes.find(c => c.id === student.class_id);
      if (!cls) return;

      const annual = cls.annual_tuition || 25000;
      const months = cls.duration_months || 10;
      const monthlyAmount = Math.round(annual / months);
      const todayStr = new Date().toISOString().split('T')[0];

      const paymentRows = [
        {
          student_id: studentId,
          payment_type: 'registration',
          month_label: 'FRAIS INSC.',
          amount: 2000,
          status: 'pending',
          due_date: todayStr
        }
      ];

      const monthNames = ['NOV', 'DÉC', 'JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛ'];
      for (let i = 1; i <= months; i++) {
        paymentRows.push({
          student_id: studentId,
          payment_type: 'monthly',
          month_label: `2025 - ${monthNames[i-1] || `MOIS ${i}`}`,
          amount: monthlyAmount,
          status: 'pending',
          due_date: todayStr
        });
      }

      const { error } = await supabase.from('payments').insert(paymentRows);
      if (error) throw error;

      setSuccess("Échéances de paiement générées avec succès !");
      loadData(supabase);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          email: newUserEmail,
          tempPassword: newUserPassword,
          firstName: newUserFirstName,
          lastName: newUserLastName,
          role: newUserRole,
          classId: newUserClassId || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur.");

      setSuccess(data.message);
      setNewUserEmail(''); setNewUserPassword(''); setNewUserFirstName(''); setNewUserLastName('');
      loadData(supabase);
    } catch (err) { setError(err.message); }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!annTitle.trim() || !annMessage.trim()) {
      setError("Veuillez renseigner le titre et le contenu de l'annonce.");
      return;
    }

    try {
      const { error } = await supabase.from('announcements').insert([{
        title: annTitle,
        message: annMessage,
        target_type: annTargetType,
        target_id: annTargetType === 'all' ? null : annTargetId || null
      }]);

      if (error) throw error;

      setSuccess("Annonce ou alerte diffusée avec succès aux destinataires concernés !");
      setAnnTitle('');
      setAnnMessage('');
      setAnnTargetType('all');
      setAnnTargetId('');
      loadData(supabase);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.assign('/register');
  };

  const teachers = profiles.filter(p => p.role === 'teacher');
  const students = profiles.filter(p => p.role === 'student');
  const filteredSchedules = schedules.filter(s => s.class_id === schedClassId);
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = ['08:30 - 10:30', '10:45 - 12:45', '14:00 - 16:00', '16:15 - 18:15'];

  const selectedSubjectObj = subjects.find(s => s.id === schedSubjectId);
  const availableTeachers = selectedSubjectObj?.teacher_id 
    ? teachers.filter(t => t.id === selectedSubjectObj.teacher_id) 
    : [];

  return (
    <div className="min-h-screen bg-[#edf2f4] text-[#1e3331] font-sans flex p-4 gap-4 relative">
      
      {/* SIDEBAR GAUCHE */}
      <aside className="w-72 bg-[#1e3331] text-white rounded-[2rem] p-6 flex flex-col justify-between shadow-xl shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center font-bold text-[#d4af37]">
              AD
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">ADMINISTRATEUR</h2>
              <p className="text-[10px] text-slate-400">Direction & CRM</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'classes', label: 'Classes', icon: LayoutDashboard },
              { id: 'subjects', label: 'Matières', icon: BookOpen },
              { id: 'schedules', label: 'Emploi du temps', icon: Calendar },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'payments', label: 'Paiements & Échéances', icon: CreditCard },
              { id: 'attendance', label: 'Suivi des absences', icon: CheckCircle2 },
              { id: 'announcements', label: 'Annonces & Alertes', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#2b4845] text-white shadow-md border-l-4 border-[#d4af37]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#d4af37]' : 'text-slate-400'} />
                  {tab.label}
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
            <h1 className="text-lg font-black tracking-tight text-[#1e3331]">Espace Administrateur</h1>
            <p className="text-xs text-slate-400">Gestion globale de l'établissement et des plannings</p>
          </div>
        </header>

        {error && (
          <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-xs border border-rose-500/20 flex justify-between items-center">
            <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
            <button onClick={() => setError(null)} className="font-bold">×</button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 text-emerald-600 p-4 rounded-2xl text-xs border border-emerald-500/20 flex justify-between items-center">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold">×</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 text-xs text-slate-400">Chargement de l'interface...</div>
        ) : (
          <div className="flex-1 space-y-6">
            
            {activeTab === 'classes' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4 h-fit">
                  <h2 className="text-sm font-bold text-[#1e3331]">Créer une classe & Frais</h2>
                  <form onSubmit={handleCreateClass} className="space-y-3">
                    <input type="text" required placeholder="Nom (ex: BTS SIO)" value={newClassName} onChange={e => setNewClassName(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none" />
                    <textarea placeholder="Description" value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none resize-none h-20" />
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Scolarité Annuelle (DH)</label>
                      <input type="number" required value={newClassTuition} onChange={e => setNewClassTuition(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Durée (Mois)</label>
                      <input type="number" required value={newClassDuration} onChange={e => setNewClassDuration(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#1e3331] hover:bg-[#2b4845] text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
                      <Plus size={16} className="text-[#d4af37]" /> Enregistrer la classe
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
                  <h2 className="text-sm font-bold text-[#1e3331]">Classes enregistrées ({classes.length})</h2>
                  <div className="space-y-3">
                    {classes.map(cls => {
                      const monthly = cls.annual_tuition / (cls.duration_months || 10);
                      return (
                        <div key={cls.id} className="p-4 bg-[#edf2f4]/60 rounded-2xl border border-slate-200/40 flex justify-between items-center text-xs">
                          <div>
                            <h3 className="font-bold text-[#1e3331] text-sm">{cls.name}</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">{cls.description || 'Aucune description'}</p>
                            <p className="text-[10px] text-[#d4af37] font-semibold mt-0.5">({monthly} DH / mois sur {cls.duration_months} mois)</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-black text-[#1e3331]">{cls.annual_tuition} DH / an</span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleOpenEditClass(cls)}
                                className="p-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white rounded-xl transition-all"
                                title="Modifier la classe"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClass(cls.id)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                                title="Supprimer la classe"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4 h-fit">
                  <h2 className="text-sm font-bold text-[#1e3331]">Ajouter une matière</h2>
                  <form onSubmit={handleCreateSubject} className="space-y-3">
                    <input type="text" required placeholder="Nom de la matière" value={newSubName} onChange={e => setNewSubName(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none" />
                    <select required value={newSubClassId} onChange={e => setNewSubClassId(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none">
                      <option value="">Sélectionner une classe</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={newSubTeacherId} onChange={e => setNewSubTeacherId(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none">
                      <option value="">Sélectionner un professeur</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                    </select>
                    <button type="submit" className="w-full py-3 bg-[#1e3331] hover:bg-[#2b4845] text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
                      <Plus size={16} className="text-[#d4af37]" /> Créer la matière
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
                  <h2 className="text-sm font-bold text-[#1e3331]">Matières enregistrées ({subjects.length})</h2>
                  <div className="space-y-3">
                    {subjects.map(sub => {
                      const cls = classes.find(c => c.id === sub.class_id);
                      const tch = teachers.find(t => t.id === sub.teacher_id);
                      return (
                        <div key={sub.id} className="p-4 bg-[#edf2f4]/60 rounded-2xl border border-slate-200/40 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#1e3331]">{sub.name}</span>
                            <span className="ml-2 text-[10px] bg-[#1e3331]/10 text-[#1e3331] px-2.5 py-0.5 rounded-full font-semibold">({cls?.name})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[#d4af37] font-semibold">{tch ? `${tch.first_name} ${tch.last_name}` : 'Non assigné'}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleOpenEditSubject(sub)}
                                className="p-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white rounded-xl transition-all"
                                title="Modifier la matière"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSubject(sub.id)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                                title="Supprimer la matière"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedules' && (
              <div className="space-y-6">
                <div className="flex gap-4 items-center bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200/50">
                  <label className="text-xs font-bold uppercase text-slate-400 pl-2">Classe affichée :</label>
                  <select 
                    value={schedClassId} 
                    onChange={e => setSchedClassId(e.target.value)}
                    className="px-4 py-2 bg-[#edf2f4] border-none rounded-xl text-xs text-[#1e3331] font-bold outline-none"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4 h-fit">
                    <h2 className="text-sm font-bold text-[#1e3331]">Placer un cours</h2>
                    <form onSubmit={handleCreateSchedule} className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Matière</label>
                        <select required value={schedSubjectId} onChange={e => {
                          setSchedSubjectId(e.target.value);
                          const sub = subjects.find(s => s.id === e.target.value);
                          if (sub?.teacher_id) {
                            setSchedTeacherId(sub.teacher_id);
                          } else {
                            setSchedTeacherId('');
                          }
                        }} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none">
                          <option value="">Sélectionner une matière</option>
                          {subjects.filter(s => s.class_id === schedClassId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Professeur (Filtré par matière)</label>
                        <select 
                          value={schedTeacherId} 
                          onChange={e => setSchedTeacherId(e.target.value)} 
                          className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none"
                        >
                          <option value="">Sélectionner un professeur</option>
                          {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Jour</label>
                          <select value={schedDay} onChange={e => setSchedDay(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none">
                            {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Créneau</label>
                          <select value={schedTimeSlot} onChange={e => setSchedTimeSlot(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none">
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Couleur du cours</label>
                        <div className="flex gap-2">
                          {colorPalette.map((col) => (
                            <button
                              key={col.value}
                              type="button"
                              onClick={() => setSchedColor(col.value)}
                              className={`w-9 h-9 rounded-xl transition-transform ${schedColor === col.value ? 'scale-110 ring-4 ring-[#1e3331]/20 shadow-md' : 'opacity-80 hover:opacity-100'}`}
                              style={{ backgroundColor: col.value }}
                              title={col.label}
                            />
                          ))}
                        </div>
                      </div>

                      <button type="submit" className="w-full py-3 bg-[#1e3331] hover:bg-[#2b4845] text-white text-xs font-bold rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center gap-2">
                        <Plus size={16} className="text-[#d4af37]" /> Ajouter au planning
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
                    <h2 className="text-sm font-bold text-[#1e3331]">Grille Hebdomadaire de la classe</h2>
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
                                const matchingSchedule = filteredSchedules.find(s => s.title?.includes(day) && s.title?.includes(slot));
                                const sub = matchingSchedule ? subjects.find(sub => sub.id === matchingSchedule.subject_id) : null;
                                const tch = matchingSchedule ? profiles.find(p => p.id === matchingSchedule.teacher_id) : null;

                                const colorMatch = matchingSchedule?.title?.match(/color:(#[0-9a-fA-F]{6})/);
                                const cardBgColor = colorMatch ? colorMatch[1] : '#1e3331';

                                return (
                                  <td key={day} className="p-2 h-24 align-top border-r border-slate-100 last:border-r-0">
                                    {matchingSchedule ? (
                                      <div 
                                        className="p-3 rounded-2xl text-white flex flex-col justify-between h-full relative group shadow-sm"
                                        style={{ backgroundColor: cardBgColor }}
                                      >
                                        <div>
                                          <p className="font-bold text-xs leading-tight">{sub?.name || 'Cours'}</p>
                                          <p className="text-[10px] opacity-80 mt-1">{tch ? `${tch.first_name} ${tch.last_name}` : 'N/A'}</p>
                                        </div>
                                        <button 
                                          onClick={() => handleDeleteSchedule(matchingSchedule.id)}
                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/40 hover:bg-black/80 text-white rounded-lg p-1.5 transition-all"
                                          title="Supprimer ce cours"
                                        >
                                          <Trash2 size={12} />
                                        </button>
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
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4 h-fit">
                  <h2 className="text-sm font-bold text-[#1e3331]">Créer un utilisateur</h2>
                  <form onSubmit={handleCreateUser} className="space-y-3">
                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none">
                      <option value="student">Étudiant</option>
                      <option value="teacher">Professeur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    {newUserRole === 'student' && (
                      <select value={newUserClassId} onChange={e => setNewUserClassId(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none">
                        <option value="">Assigner à une classe</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" required placeholder="Prénom" value={newUserFirstName} onChange={e => setNewUserFirstName(e.target.value)} className="px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none" />
                      <input type="text" required placeholder="Nom" value={newUserLastName} onChange={e => setNewUserLastName(e.target.value)} className="px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none" />
                    </div>
                    <input type="email" required placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none" />
                    <input type="password" required minLength={6} placeholder="Mot de passe temporaire" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] outline-none" />
                    <button type="submit" className="w-full py-3 bg-[#1e3331] hover:bg-[#2b4845] text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
                      <Plus size={16} className="text-[#d4af37]" /> Créer le compte
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
                  <h2 className="text-sm font-bold text-[#1e3331]">Annuaire des utilisateurs ({profiles.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="pb-3">Nom</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Rôle & Classe</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {profiles.map(p => {
                          const cls = classes.find(c => c.id === p.class_id);
                          return (
                            <tr key={p.id} className="hover:bg-[#edf2f4]/30">
                              <td className="py-3.5 font-semibold text-[#1e3331]">{p.first_name} {p.last_name}</td>
                              <td className="py-3.5 text-slate-500">{p.email}</td>
                              <td className="py-3.5">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#1e3331]/10 text-[#1e3331]">{p.role}</span>
                                {cls && <span className="ml-2 text-[#d4af37] font-semibold text-[10px]">({cls.name})</span>}
                              </td>
                              <td className="py-3.5 text-right space-x-2">
                                <button 
                                  onClick={() => handleOpenEditUser(p)} 
                                  className="p-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white rounded-xl transition-all"
                                  title="Modifier l'utilisateur"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(p.id)} 
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                                  title="Supprimer l'utilisateur"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-6">
                <h2 className="text-sm font-bold text-[#1e3331]">Suivi Financier & Validation des Paiements Physiques</h2>
                <p className="text-xs text-slate-400">Cliquez sur une carte d'étudiant pour ouvrir sa fiche détaillée d'échéances.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.length === 0 ? (
                    <p className="text-xs text-slate-400">Aucun étudiant inscrit.</p>
                  ) : (
                    students.map(student => {
                      const studentPayments = payments.filter(p => p.student_id === student.id);
                      const cls = classes.find(c => c.id === student.class_id);
                      const totalPaidCount = studentPayments.filter(p => p.status === 'paid').length;

                      return (
                        <div 
                          key={student.id} 
                          onClick={() => setSelectedStudentForModal(student)}
                          className="p-5 bg-[#edf2f4]/50 hover:bg-[#edf2f4] rounded-2xl border border-slate-200/60 cursor-pointer transition-all flex flex-col justify-between space-y-4 group shadow-sm"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-xs font-bold text-[#1e3331] group-hover:text-[#2b4845] transition-colors">{student.first_name} {student.last_name}</h3>
                              <span className="p-1.5 bg-white rounded-xl shadow-xs text-slate-400 group-hover:text-[#1e3331]">
                                <Eye size={14} />
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Classe : {cls?.name || 'Non assignée'}</p>
                          </div>

                          <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-200/40">
                            <span className="font-semibold text-slate-500">{studentPayments.length} échéances au total</span>
                            <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                              {totalPaidCount} / {studentPayments.length} réglées
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold text-[#1e3331]">Feuilles de présence & Assiduité</h2>
                    <p className="text-xs text-slate-400">Centralisation des rapports de présence transmis par les enseignants</p>
                  </div>
                  <span className="px-3 py-1 bg-[#1e3331]/10 text-[#1e3331] font-bold text-xs rounded-full">
                    {announcements.filter(a => a.title?.startsWith('Feuille de présence')).length} rapports reçus
                  </span>
                </div>

                <div className="space-y-3">
                  {announcements.filter(a => a.title?.startsWith('Feuille de présence')).length === 0 ? (
                    <div className="text-center py-16 space-y-2 bg-[#edf2f4]/30 rounded-2xl border border-dashed border-slate-200">
                      <CheckCircle2 size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs text-slate-400 font-medium">Aucune feuille de présence transmise pour le moment.</p>
                    </div>
                  ) : (
                    announcements
                      .filter(a => a.title?.startsWith('Feuille de présence'))
                      .map(report => (
                        <div 
                          key={report.id} 
                          className="p-5 bg-[#1e3331]/5 rounded-2xl border border-[#1e3331]/10 space-y-3 text-xs transition-all hover:shadow-sm relative group"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                              <h3 className="font-bold text-[#1e3331] text-sm">{report.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold bg-[#1e3331] text-[#d4af37] px-3 py-1 rounded-full">
                                Rapport Validé
                              </span>
                              <button
                                onClick={() => handleDeleteAttendanceReport(report.id)}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                                title="Supprimer cette feuille de présence"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200/60 font-mono">
                            {report.message}
                          </p>

                          <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
                            <span>Réf: {report.id}</span>
                            <span>Transmis le {new Date(report.created_at).toLocaleDateString()} à {new Date(report.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4 h-fit">
                  <h2 className="text-sm font-bold text-[#1e3331]">Envoyer une annonce / Alerte</h2>
                  <form onSubmit={handleSendAnnouncement} className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Cible de diffusion</label>
                      <select 
                        value={annTargetType} 
                        onChange={e => {
                          setAnnTargetType(e.target.value);
                          setAnnTargetId('');
                        }} 
                        className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none font-semibold"
                      >
                        <option value="all">Tous les utilisateurs (Établissement)</option>
                        <option value="class">Une classe spécifique</option>
                        <option value="student">Un étudiant en particulier</option>
                      </select>
                    </div>

                    {annTargetType === 'class' && (
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Choisir la classe</label>
                        <select 
                          required 
                          value={annTargetId} 
                          onChange={e => setAnnTargetId(e.target.value)} 
                          className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none"
                        >
                          <option value="">-- Sélectionner une classe --</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}

                    {annTargetType === 'student' && (
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Choisir l'étudiant</label>
                        <select 
                          required 
                          value={annTargetId} 
                          onChange={e => setAnnTargetId(e.target.value)} 
                          className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none"
                        >
                          <option value="">-- Sélectionner un étudiant --</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Titre de l'annonce ou de l'alerte</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: Rappel : Retard de paiement échéance" 
                        value={annTitle} 
                        onChange={e => setAnnTitle(e.target.value)} 
                        className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none" 
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Message détaillé</label>
                      <textarea 
                        required 
                        rows={4} 
                        placeholder="Rédigez votre message ici..." 
                        value={annMessage} 
                        onChange={e => setAnnMessage(e.target.value)} 
                        className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none resize-none" 
                      />
                    </div>

                    <button type="submit" className="w-full py-3 bg-[#1e3331] hover:bg-[#2b4845] text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
                      <Send size={16} className="text-[#d4af37]" /> Diffuser l'annonce
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
                  <h2 className="text-sm font-bold text-[#1e3331]">Historique des annonces envoyées ({announcements.length})</h2>
                  <div className="space-y-3">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6">Aucune annonce diffusée pour le moment.</p>
                    ) : (
                      announcements.map(ann => (
                        <div key={ann.id} className="p-4 bg-[#edf2f4]/60 rounded-2xl border border-slate-200/40 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-[#1e3331] text-sm">{ann.title}</h3>
                            <span className="text-[10px] uppercase font-bold bg-[#1e3331]/10 text-[#1e3331] px-2.5 py-0.5 rounded-full">
                              Cible : {ann.target_type === 'all' ? 'Général' : ann.target_type}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{ann.message}</p>
                          <p className="text-[10px] text-slate-400 text-right">{new Date(ann.created_at).toLocaleDateString()} à {new Date(ann.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALE / FICHE DÉTAILLÉE DE L'ÉTUDIANT */}
      {selectedStudentForModal && (() => {
        const studentPayments = payments.filter(p => p.student_id === selectedStudentForModal.id);
        const cls = classes.find(c => c.id === selectedStudentForModal.class_id);
        const totalPaidAmount = studentPayments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalAnnual = cls?.annual_tuition || 25000;
        const remainingTotal = Math.max(0, totalAnnual - totalPaidAmount);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[#18181b] text-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-[#d4af37] uppercase bg-[#1e3331] px-3 py-1 rounded-full">Fiche Échéancier Étudiant</span>
                  <h2 className="text-lg font-black tracking-wide mt-2">{selectedStudentForModal.first_name} {selectedStudentForModal.last_name}</h2>
                  <p className="text-xs text-slate-400">Classe : {cls?.name || 'Non assignée'}</p>
                </div>
                
                <button 
                  onClick={() => setSelectedStudentForModal(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-all"
                  title="Fermer la fiche"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-[#222225] p-4 rounded-2xl border border-slate-800 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total réglé</p>
                  <p className="text-base font-black text-emerald-400 mt-1">{totalPaidAmount} DH</p>
                </div>
                <div className="border-x border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Dette à payer</p>
                  <p className="text-base font-black text-rose-400 mt-1">{remainingTotal} DH</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Annuel</p>
                  <p className="text-base font-black text-slate-200 mt-1">{totalAnnual} DH</p>
                </div>
              </div>

              {studentPayments.length === 0 ? (
                <div className="text-center py-8 space-y-4 bg-[#222225] rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">Aucune échéance de paiement n'a encore été générée pour cet étudiant.</p>
                  <button
                    onClick={() => handleGeneratePaymentsForStudent(selectedStudentForModal.id)}
                    className="py-2.5 px-6 bg-[#d4af37] hover:bg-[#c29f31] text-[#1e3331] text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <Plus size={14} /> Générer les échéances de l'année
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Échéances de paiement</h3>
                    <span className="text-[10px] text-slate-500">Mois par mois</span>
                  </div>

                  <div className="bg-[#222225] rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                          <th className="p-3.5 w-12 text-center">#</th>
                          <th className="p-3.5">Statut</th>
                          <th className="p-3.5">Mois</th>
                          <th className="p-3.5">À payer</th>
                          <th className="p-3.5 text-right">Réglé / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {studentPayments.map((pay, index) => {
                          const isPaid = pay.status === 'paid';
                          const indexStr = String(index).padStart(2, '0');

                          return (
                            <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5 font-mono text-slate-400 text-center">{indexStr}</td>
                              <td className="p-3.5">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isPaid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
                              </td>
                              <td className="p-3.5 font-bold tracking-wide text-slate-200">{pay.month_label || pay.payment_type}</td>
                              <td className="p-3.5 font-mono text-slate-300">{pay.amount} DH</td>
                              <td className="p-3.5 text-right">
                                {isPaid ? (
                                  <span className="font-mono text-emerald-400 font-bold">{pay.amount},00 DH</span>
                                ) : (
                                  <button
                                    onClick={() => handleValidatePayment(pay.id)}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                                  >
                                    <Check size={12} /> Payer
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedStudentForModal(null)}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Fermer la fiche
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODALE / FORMULAIRE DE MODIFICATION D'UNE CLASSE */}
      {editingClass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] text-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase bg-[#1e3331] px-3 py-1 rounded-full">Administration</span>
                <h2 className="text-lg font-black tracking-wide mt-2">Modifier la classe</h2>
              </div>
              <button 
                onClick={() => setEditingClass(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Nom de la classe</label>
                <input 
                  type="text" 
                  required 
                  value={editClassName} 
                  onChange={e => setEditClassName(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Description</label>
                <textarea 
                  value={editClassDesc} 
                  onChange={e => setEditClassDesc(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none resize-none h-20" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Scolarité Annuelle (DH)</label>
                <input 
                  type="number" 
                  required 
                  value={editClassTuition} 
                  onChange={e => setEditClassTuition(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Durée (Mois)</label>
                <input 
                  type="number" 
                  required 
                  value={editClassDuration} 
                  onChange={e => setEditClassDuration(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none" 
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 bg-[#d4af37] hover:bg-[#c29f31] text-[#1e3331] text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE / FORMULAIRE DE MODIFICATION D'UNE MATIÈRE */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] text-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase bg-[#1e3331] px-3 py-1 rounded-full">Administration</span>
                <h2 className="text-lg font-black tracking-wide mt-2">Modifier la matière</h2>
              </div>
              <button 
                onClick={() => setEditingSubject(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Nom de la matière</label>
                <input 
                  type="text" 
                  required 
                  value={editSubName} 
                  onChange={e => setEditSubName(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Classe</label>
                <select 
                  required 
                  value={editSubClassId} 
                  onChange={e => setEditSubClassId(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Professeur</label>
                <select 
                  value={editSubTeacherId} 
                  onChange={e => setEditSubTeacherId(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none"
                >
                  <option value="">Sélectionner un professeur</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 bg-[#d4af37] hover:bg-[#c29f31] text-[#1e3331] text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE / FORMULAIRE DE MODIFICATION D'UN UTILISATEUR */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] text-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase bg-[#1e3331] px-3 py-1 rounded-full">Administration</span>
                <h2 className="text-lg font-black tracking-wide mt-2">Modifier l'utilisateur</h2>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Rôle</label>
                <select 
                  value={editUserRole} 
                  onChange={e => setEditUserRole(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none"
                >
                  <option value="student">Étudiant</option>
                  <option value="teacher">Professeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {editUserRole === 'student' && (
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Classe</label>
                  <select 
                    value={editUserClassId} 
                    onChange={e => setEditUserClassId(e.target.value)} 
                    className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none"
                  >
                    <option value="">Aucune classe</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Prénom</label>
                  <input 
                    type="text" 
                    required 
                    value={editUserFirstName} 
                    onChange={e => setEditUserFirstName(e.target.value)} 
                    className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Nom</label>
                  <input 
                    type="text" 
                    required 
                    value={editUserLastName} 
                    onChange={e => setEditUserLastName(e.target.value)} 
                    className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Email</label>
                <input 
                  type="email" 
                  required 
                  value={editUserEmail} 
                  onChange={e => setEditUserEmail(e.target.value)} 
                  className="w-full px-4 py-3 bg-[#222225] border border-slate-800 rounded-2xl text-xs text-white mt-1 outline-none" 
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 bg-[#d4af37] hover:bg-[#c29f31] text-[#1e3331] text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}