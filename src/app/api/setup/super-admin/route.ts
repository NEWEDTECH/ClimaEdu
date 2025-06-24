import { NextRequest, NextResponse } from 'next/server';
import { CreateSuperAdminUseCase } from '@/_core/modules/user';
import type { CreateSuperAdminInput } from '@/_core/modules/user';
import { setupApiContainer } from './container-setup';
import { useCases as userUseCases } from '@/_core/shared/container/modules/user/symbols';

/**
 * API Route for creating a SUPER_ADMIN user
 * This endpoint is protected by a secret key and can only be used when no SUPER_ADMIN exists
 */
export async function POST(request: NextRequest) {
  try {
    // Setup API container
    const apiContainer = setupApiContainer();

    // Check if the setup key is provided and valid
    const setupKey = request.headers.get('X-Setup-Key');
    const expectedKey = process.env.SUPER_ADMIN_SETUP_KEY;

    if (!expectedKey) {
      return NextResponse.json(
        { error: 'Setup key not configured on server' },
        { status: 500 }
      );
    }

    if (!setupKey || setupKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid or missing setup key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, name, password } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, password' },
        { status: 400 }
      );
    }

    // Get the use case from container
    const createSuperAdminUseCase = apiContainer.get<CreateSuperAdminUseCase>(
      userUseCases.CreateSuperAdminUseCase
    );

    // Create the input
    const input: CreateSuperAdminInput = {
      email,
      name,
      password,
    };

    // Execute the use case
    const result = await createSuperAdminUseCase.execute(input);

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'SUPER_ADMIN user created successfully',
        userId: result.user.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating SUPER_ADMIN:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('already exists') ? 409 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Handle other HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
