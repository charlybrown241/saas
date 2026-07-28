'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Award,
  LogOut, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  ClipboardCheck,
  Send
} from 'lucide-react';

export default function TeacherDashboard() {
  const [supabase, setSupabase] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [teacherProfile, setTeacherProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);

  // Formulaire d'ajout de note
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [scoreValue, setScoreValue] = useState('');
  const [maxScoreValue, setMaxScoreValue] = useState('20');
  const [commentValue, setCommentValue] = useState('');

  // États pour la feuille de présence
  const [attendanceClassId, setAttendanceClassId] = useState('');
  const [attendanceSubjectId, setAttendanceSubjectId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'present' | 'absent' | 'late' }
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Horloge en direct pour la feuille de présence
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          setTeacherProfile(prof);
          loadTeacherData(client, user.id);
        }
      } catch (e) {
        console.error("Erreur init Supabase", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadTeacherData = async (client, teacherId) => {
    setLoading(true);
    try {
      const { data: clsData } = await client.from('classes').select('*');
      setClasses(clsData || []);

      const { data: subData } = await client.from('subjects').select('*');
      setSubjects(subData || []);

      const { data: schData } = await client.from('schedules').select('*');
      setSchedules(schData || []);

      const { data: profData } = await client.from('profiles').select('*').eq('role', 'student');
      setStudents(profData || []);

      const teacherSubjectIds = (subData || [])
        .filter(sub => sub.teacher_id === teacherId)
        .map(sub => sub.id);

      if (teacherSubjectIds.length > 0) {
        const { data: grdData } = await client
          .from('grades')
          .select('*')
          .in('subject_id', teacherSubjectIds);
        setGrades(grdData || []);
      } else {
        setGrades([]);
      }

    } catch (err) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedStudentId || !selectedSubjectId || !scoreValue) {
      setError("Veuillez remplir tous les champs obligatoires pour attribuer la note.");
      return;
    }

    try {
      const { error } = await supabase.from('grades').insert([{
        student_id: selectedStudentId,
        subject_id: selectedSubjectId,
        score: parseFloat(scoreValue),
        max_score: parseFloat(maxScoreValue) || 20,
        comment: commentValue || 'Évaluation'
      }]);

      if (error) throw error;

      setSuccess("Note attribuée et publiée avec succès !");
      setScoreValue('');
      setCommentValue('');
      loadTeacherData(supabase, teacherProfile?.id);
    } catch (err) {
      setError(err.message);
    }
  };

  // Gestion des statuts de présence par étudiant
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Envoi de la feuille de présence (Correction de la contrainte target_id en configurant target_type sur 'all' et target_id à null)
  const handleSendAttendanceSheet = async () => {
    setError(null);
    setSuccess(null);

    if (!attendanceClassId || !attendanceSubjectId) {
      setError("Veuillez sélectionner une classe et une matière pour générer la feuille de présence.");
      return;
    }

    const selectedClassObj = classes.find(c => c.id === attendanceClassId);
    const selectedSubjectObj = subjects.find(s => s.id === attendanceSubjectId);
    const classStudents = students.filter(s => s.class_id === attendanceClassId);

    if (classStudents.length === 0) {
      setError("Aucun étudiant trouvé dans cette classe.");
      return;
    }

    const matchingSchedule = schedules.find(s => s.class_id === attendanceClassId && s.subject_id === attendanceSubjectId);
    const fallbackScheduleId = matchingSchedule?.id || schedules[0]?.id;

    if (!fallbackScheduleId) {
      setError("Veuillez vous assurer qu'un cours est configuré dans l'emploi du temps pour cette classe et cette matière.");
      return;
    }

    try {
      // 1. Enregistrement détaillé dans la table "attendance"
      const attendanceInserts = classStudents.map(st => ({
        schedule_id: fallbackScheduleId,
        student_id: st.id,
        status: attendanceRecords[st.id] || 'present'
      }));

      const { error: attError } = await supabase.from('attendance').insert(attendanceInserts);
      if (attError) throw attError;

      // 2. Construction du rapport texte pour la table "announcements" (sans violer la FK target_id)
      let reportContent = `Feuille de présence transmise par : ${teacherProfile?.first_name || ''} ${teacherProfile?.last_name || ''}\n`;
      reportContent += `Matière : ${selectedSubjectObj?.name || 'N/A'}\n`;
      reportContent += `Classe : ${selectedClassObj?.name || 'N/A'}\n`;
      reportContent += `Date et heure : ${currentDateTime.toLocaleString('fr-FR')}\n\n`;
      reportContent += `Détails des statuts :\n`;

      classStudents.forEach(st => {
        const status = attendanceRecords[st.id] || 'present';
        reportContent += `- ${st.first_name} ${st.last_name} : ${status.toUpperCase()}\n`;
      });

      const { error: annError } = await supabase.from('announcements').insert([{
        title: `Feuille de présence - ${selectedSubjectObj?.name} (${selectedClassObj?.name})`,
        message: reportContent,
        target_type: 'all',
        target_id: null // Évite l'erreur de contrainte de clé étrangère
      }]);

      if (annError) throw annError;

      setSuccess("Feuille de présence enregistrée et transmise avec succès à l'administration !");
      setAttendanceRecords({});
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la feuille de présence : " + err.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.assign('/register');
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = ['08:30 - 10:30', '10:45 - 12:45', '14:00 - 16:00', '16:15 - 18:15'];

  const mySubjects = subjects.filter(sub => sub.teacher_id === teacherProfile?.id);
  const filteredStudentsForAttendance = students.filter(s => s.class_id === attendanceClassId);

  if (loading) return <div className="min-h-screen bg-[#edf2f4] text-[#1e3331] flex items-center justify-center text-xs font-bold">Chargement de l'espace professeur...</div>;

  return (
    <div className="min-h-screen bg-[#edf2f4] text-[#1e3331] font-sans flex p-4 gap-4">
      
      {/* SIDEBAR GAUCHE */}
      <aside className="w-72 bg-[#1e3331] text-white rounded-[2rem] p-6 flex flex-col justify-between shadow-xl shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border-2 border-[#d4af37] flex items-center justify-center font-bold text-[#d4af37]">
              {teacherProfile?.first_name?.[0]}{teacherProfile?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">{teacherProfile?.first_name} {teacherProfile?.last_name}</h2>
              <p className="text-[10px] text-slate-400">Espace Professeur</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'courses', label: 'Mes Cours & Planning', icon: Calendar },
              { id: 'attendance', label: 'Feuille de Présence', icon: ClipboardCheck },
              { id: 'grades', label: 'Gestion des Notes', icon: Award },
              { id: 'students', label: 'Suivi des Étudiants', icon: Users }
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
            <h1 className="text-lg font-black tracking-tight text-[#1e3331]">Tableau de bord Professeur</h1>
            <p className="text-xs text-slate-400">Gérez vos cours, faites l'appel et suivez vos étudiants</p>
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

        <div className="flex-1 space-y-6">
          
          {/* ONGLET COURS & PLANNING */}
          {activeTab === 'courses' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
              <h2 className="text-sm font-bold text-[#1e3331]">Votre Emploi du Temps Global</h2>
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
                          const matchingSchedule = schedules.find(s => s.teacher_id === teacherProfile?.id && s.title?.includes(day) && s.title?.includes(slot));
                          const sub = matchingSchedule ? subjects.find(sub => sub.id === matchingSchedule.subject_id) : null;
                          const cls = matchingSchedule ? classes.find(c => c.id === matchingSchedule.class_id) : null;

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
                                    <p className="font-bold text-xs leading-tight">{sub?.name || 'Cours'}</p>
                                    <p className="text-[10px] opacity-80 mt-1">Classe : {cls?.name || 'N/A'}</p>
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

          {/* ONGLET : FEUILLE DE PRÉSENCE */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-sm font-bold text-[#1e3331]">Feuille de Présence en Direct</h2>
                  <p className="text-xs text-slate-400">Sélectionnez la classe et la matière, puis cochez les présences avant d'enregistrer et d'envoyer à l'administration.</p>
                </div>
                <div className="px-4 py-2 bg-[#edf2f4] rounded-2xl text-xs font-mono font-semibold text-[#1e3331]">
                  🕒 {currentDateTime.toLocaleString('fr-FR')}
                </div>
              </div>

              {/* Sélection Classe et Matière */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#edf2f4]/50 p-4 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Sélectionner la classe</label>
                  <select 
                    value={attendanceClassId} 
                    onChange={e => setAttendanceClassId(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none shadow-sm"
                  >
                    <option value="">-- Choisir une classe --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Sélectionner la matière</label>
                  <select 
                    value={attendanceSubjectId} 
                    onChange={e => setAttendanceSubjectId(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none shadow-sm"
                  >
                    <option value="">-- Choisir une matière --</option>
                    {mySubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Liste des étudiants et boutons de présence */}
              {attendanceClassId ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Étudiants de la classe ({filteredStudentsForAttendance.length})
                  </h3>

                  {filteredStudentsForAttendance.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-2xl">Aucun étudiant inscrit dans cette classe.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredStudentsForAttendance.map(st => {
                        const currentStatus = attendanceRecords[st.id] || 'present';
                        return (
                          <div key={st.id} className="p-4 bg-white rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
                            <div>
                              <p className="font-bold text-xs text-[#1e3331]">{st.first_name} {st.last_name}</p>
                              <p className="text-[11px] text-slate-400">{st.email}</p>
                            </div>

                            {/* Boutons de sélection de statut */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'present')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                  currentStatus === 'present' 
                                    ? 'bg-emerald-500 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Présent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'absent')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                  currentStatus === 'absent' 
                                    ? 'bg-rose-500 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'late')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                  currentStatus === 'late' 
                                    ? 'bg-amber-500 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Retard
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bouton d'envoi global vers l'admin */}
                  {filteredStudentsForAttendance.length > 0 && (
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleSendAttendanceSheet}
                        className="px-6 py-3.5 bg-[#1e3331] hover:bg-[#2b4845] text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center gap-2"
                      >
                        <Send size={16} className="text-[#d4af37]" /> Enregistrer et envoyer à l'Admin
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  Veuillez sélectionner une classe ci-dessus pour afficher la liste des étudiants.
                </div>
              )}
            </div>
          )}

          {/* ONGLET GESTION DES NOTES */}
          {activeTab === 'grades' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4 h-fit">
                <h2 className="text-sm font-bold text-[#1e3331]">Attribuer une note</h2>
                <form onSubmit={handleAddGrade} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Étudiant</label>
                    <select required value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none">
                      <option value="">Sélectionner un étudiant</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Matière (Vos cours attribués)</label>
                    <select required value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none">
                      <option value="">Sélectionner l'une de vos matières</option>
                      {mySubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Note</label>
                      <input type="number" step="0.5" required placeholder="15" value={scoreValue} onChange={e => setScoreValue(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Sur / Max</label>
                      <input type="number" required value={maxScoreValue} onChange={e => setMaxScoreValue(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Intitulé / Commentaire</label>
                    <input type="text" placeholder="Ex: Contrôle 1, Projet..." value={commentValue} onChange={e => setCommentValue(e.target.value)} className="w-full px-4 py-3 bg-[#edf2f4] border-none rounded-2xl text-xs text-[#1e3331] mt-1 outline-none" />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#1e3331] hover:bg-[#2b4845] text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
                    <Plus size={16} className="text-[#d4af37]" /> Publier la note
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
                <h2 className="text-sm font-bold text-[#1e3331]">Vos notes publiées ({grades.length})</h2>
                <div className="space-y-3">
                  {grades.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6">Aucune note enregistrée pour vos matières pour le moment.</p>
                  ) : (
                    grades.map(g => {
                      const std = students.find(s => s.id === g.student_id);
                      const sub = subjects.find(s => s.id === g.subject_id);
                      return (
                        <div key={g.id} className="p-4 bg-[#edf2f4]/60 rounded-2xl border border-slate-200/40 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#1e3331] text-sm">{std ? `${std.first_name} ${std.last_name}` : 'Étudiant'}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5"><strong className="text-[#1e3331]">{sub?.name}</strong> — {g.comment || 'Évaluation'}</p>
                          </div>
                          <span className="text-sm font-black text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                            {g.score} / {g.max_score}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET SUIVI DES ÉTUDIANTS */}
          {activeTab === 'students' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 space-y-4">
              <h2 className="text-sm font-bold text-[#1e3331]">Liste des étudiants inscrits ({students.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <tr><th className="pb-3">Nom & Prénom</th><th className="pb-3">Email</th><th className="pb-3">Classe</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(s => {
                      const cls = classes.find(c => c.id === s.class_id);
                      return (
                        <tr key={s.id} className="hover:bg-[#edf2f4]/30">
                          <td className="py-3.5 font-semibold text-[#1e3331]">{s.first_name} {s.last_name}</td>
                          <td className="py-3.5 text-slate-500">{s.email}</td>
                          <td className="py-3.5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#1e3331]/10 text-[#1e3331]">{cls?.name || 'Non assignée'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}