import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, tempPassword, firstName, lastName, role, classId } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (action === 'create_user') {
      if (!email || !tempPassword || !firstName || !lastName || !role) {
        return NextResponse.json({ error: "Tous les champs requis doivent être renseignés." }, { status: 400 });
      }

      // 1. Création du compte dans Supabase Auth
      const { data: newAuth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      });

      if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

      const userId = newAuth.user.id;

      // 2. Insertion du profil avec le bon rôle ('student', 'teacher', 'admin')
      const { error: profErr } = await supabaseAdmin.from('profiles').insert([{
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        role: role,
        class_id: classId || null
      }]);

      if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });

      // 3. SI C'EST UN ÉTUDIANT : Génération automatique des échéances de paiement
      if (role === 'student' && classId) {
        const { data: classData } = await supabaseAdmin
          .from('classes')
          .select('*')
          .eq('id', classId)
          .maybeSingle();

        if (classData) {
          const annualTuition = classData.annual_tuition || 25000;
          const monthsCount = classData.duration_months || 10;
          const monthlyAmount = Math.round(annualTuition / monthsCount);

          const paymentRows = [
            {
              student_id: userId,
              payment_type: 'registration',
              month_label: 'Inscription',
              amount: 2000,
              status: 'pending'
            }
          ];

          for (let i = 1; i <= monthsCount; i++) {
            paymentRows.push({
              student_id: userId,
              payment_type: 'monthly',
              month_label: `Mois ${i}`,
              amount: monthlyAmount,
              status: 'pending'
            });
          }

          await supabaseAdmin.from('payments').insert(paymentRows);
        }
      }

      return NextResponse.json({ success: true, message: "Utilisateur créé avec succès et échéances financières initialisées !" }, { status: 201 });
    }

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });

  } catch (err) {
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}