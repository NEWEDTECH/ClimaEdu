import { NextResponse } from 'next/server';

/**
 * API Health Check endpoint
 * Returns the current status of the API
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'NOT SET',
    },
    { status: 200 }
  );
}
