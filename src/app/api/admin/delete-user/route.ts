import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin, getAdminAuth } from '@/_core/shared/firebase/firebase-admin';

export async function DELETE(request: NextRequest) {
  try {
    initializeFirebaseAdmin();

    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId ou email é obrigatório' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();

    // Try by userId first, fallback to email lookup
    let authUid: string | null = null;

    if (userId) {
      try {
        const userRecord = await adminAuth.getUser(userId);
        authUid = userRecord.uid;
      } catch (e: unknown) {
        const code = e !== null && typeof e === 'object' && 'code' in e
          ? (e as { code: string }).code
          : null;
        if (code !== 'auth/user-not-found') throw e;
      }
    }

    // If not found by userId, try by email
    if (!authUid && email) {
      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        authUid = userRecord.uid;
      } catch (e: unknown) {
        const code = e !== null && typeof e === 'object' && 'code' in e
          ? (e as { code: string }).code
          : null;
        if (code !== 'auth/user-not-found') throw e;
      }
    }

    if (!authUid) {
      // User doesn't exist in Auth — nothing to delete
      return NextResponse.json({ success: true }, { status: 200 });
    }

    await adminAuth.deleteUser(authUid);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user from Authentication:', error);
    const message = error instanceof Error ? error.message : 'Falha ao excluir usuário da autenticação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
