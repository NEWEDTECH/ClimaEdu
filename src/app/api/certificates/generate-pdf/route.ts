import { NextRequest, NextResponse } from 'next/server';
import { certificatesContainer } from '../container';
import { PdfGeneratorService } from '../services/PdfGeneratorService';
import { StorageService } from '../services/StorageService';

/**
 * API route for generating certificate PDF
 * Generates real PDF certificates and uploads them to Firebase Storage
 */

// Vercel function configuration for serverless environment
export const config = {
  maxDuration: 60, // 60 seconds - requires paid Vercel plan for >10s
};

interface GeneratePDFRequest {
  userId: string;
  courseId: string;
  institutionId: string;
  courseName: string;
  instructorName?: string;
  hoursCompleted?: number;
  grade?: number;
  completionDate?: string;
  studentName?: string;
}

interface GeneratePDFResponse {
  certificateUrl: string;
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GeneratePDFResponse>> {
  try {
    const body: GeneratePDFRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.courseId || !body.institutionId || !body.courseName) {
      return NextResponse.json(
        {
          certificateUrl: '',
          success: false,
          message: 'Missing required fields: userId, courseId, institutionId, and courseName are required'
        },
        { status: 400 }
      );
    }

    // Get services from container
    const pdfGeneratorService = certificatesContainer.get(PdfGeneratorService);
    const storageService = certificatesContainer.get(StorageService);

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Format issue date
    const issueDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Generate PDF
    const pdfBuffer = await pdfGeneratorService.generateCertificatePdf({
      studentName: body.studentName || 'Nome do Estudante',
      courseName: body.courseName,
      institutionName: 'ClimaEdu', // You might want to get this from a database
      instructorName: body.instructorName,
      hoursCompleted: body.hoursCompleted,
      grade: body.grade,
      issueDate,
      certificateNumber,
    });

    // Upload to Firebase Storage
    const uploadResult = await storageService.uploadCertificate({
      pdfBuffer,
      userId: body.userId,
      courseId: body.courseId,
      institutionId: body.institutionId,
    });

    return NextResponse.json({
      certificateUrl: uploadResult.certificateUrl,
      success: true,
      message: 'Certificate PDF generated and uploaded successfully'
    });

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    
    return NextResponse.json(
      {
        certificateUrl: '',
        success: false,
        message: `Internal server error while generating certificate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}