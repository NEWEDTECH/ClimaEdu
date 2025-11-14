import { NextResponse } from 'next/server';
import { Container } from 'inversify';
import { FirebaseAdminScormContentRepository } from '@/_core/modules/content/infrastructure/repositories/implementations/FirebaseAdminScormContentRepository';
import { TestFirestoreConnectionUseCase } from '@/_core/modules/content/core/use-cases/test-firestore-connection';
import { getAdminFirestore, getAdminStorage } from '@/_core/shared/firebase/firebase-admin';

// Initialize DI container for test
const testContainer = new Container();

const firestore = getAdminFirestore();
const storage = getAdminStorage();
const bucket = storage.bucket();

testContainer
  .bind('IScormContentRepository')
  .toConstantValue(new FirebaseAdminScormContentRepository(firestore, bucket));

testContainer
  .bind(TestFirestoreConnectionUseCase)
  .toSelf();

export async function GET(request: Request) {
  // Only allow in development or when explicitly testing
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 403 }
    );
  }

  // Get institutionId from query params (optional)
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('institutionId') || 'test-institution';

  console.log('\n=================================');
  console.log('🧪 TEST ENDPOINT: /api/test/firestore-auth');
  console.log(`🧪 Institution ID: ${institutionId}`);
  console.log('=================================\n');

  try {
    const useCase = testContainer.get(TestFirestoreConnectionUseCase);
    const result = await useCase.execute(institutionId);

    console.log('\n=================================');
    console.log('🧪 TEST RESULT:');
    console.log(JSON.stringify(result, null, 2));
    console.log('=================================\n');

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('\n=================================');
    console.error('❌ TEST ENDPOINT ERROR:');
    console.error(error);
    console.error('=================================\n');

    return NextResponse.json(
      {
        success: false,
        message: 'Test endpoint failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
