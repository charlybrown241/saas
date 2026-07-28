import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Récupération des champs envoyés par le formulaire
    const establishmentName = body.establishmentName || body.name || body.establishment || body.firstName;
    const email = body.email;
    const password = body.password || body.tempPassword;
    const confirmPassword = body.confirmPassword;

    // Vérification de la correspondance des mots de passe si le champ confirmation existe
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas." },
        { status: 400 }
      );
    }

    // Vérification des champs requis
    if (!establishmentName || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Création du compte dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { establishment_name: establishmentName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insertion dans votre table public.profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      {
        id: userId,
        email,
        role: 'admin',
        first_name: establishmentName,
        last_name: 'Admin'
      }
    ]);

    if (profileError) {
      // Si l'insertion du profil échoue, on supprime l'utilisateur Auth pour garder la base propre
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Compte établissement créé avec succès !" },
      { status: 201 }
    );

  } catch (err) {
    console.error("Erreur serveur (create-user):", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
