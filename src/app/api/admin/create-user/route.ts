import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { initializeFirebaseAdmin, getAdminAuth, getAdminFirestore } from '@/_core/shared/firebase/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    initializeFirebaseAdmin();

    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'name, email e role são obrigatórios' },
        { status: 400 }
      );
    }

    const temporaryPassword = nanoid(8);

    // Cria no Firebase Authentication via Admin SDK (NÃO faz auto-login)
    const adminAuth = getAdminAuth();
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password: temporaryPassword,
        emailVerified: false,
      });
    } catch (authError: unknown) {
      const code = authError !== null && typeof authError === 'object' && 'code' in authError
        ? (authError as { code: string }).code
        : null;
      if (code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'Já existe um usuário com este email.' },
          { status: 409 }
        );
      }
      throw authError;
    }

    const userId = userRecord.uid;
    const now = new Date();

    // Salva o documento do usuário no Firestore via Admin SDK
    const firestore = getAdminFirestore();
    await firestore.collection('users').doc(userId).set({
      id: userId,
      name,
      email: { value: email },
      role,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { userId, temporaryPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    const message = error instanceof Error ? error.message : 'Falha ao criar usuário';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
