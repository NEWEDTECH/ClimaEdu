import { NextRequest, NextResponse } from 'next/server';
import { scormContainer } from '../container';
import { UploadScormContentUseCase } from '../../../../_core/modules/content/core/use-cases/upload-scorm-content/upload-scorm-content.use-case';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const institutionId = formData.get('institutionId') as string | null;

    if (!file || !name || !institutionId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, name, institutionId' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadUseCase = scormContainer.get(UploadScormContentUseCase);
    const result = await uploadUseCase.execute({
      file: buffer,
      name,
      institutionId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('SCORM Upload Error:', error);
    return NextResponse.json(
      { error: message || 'Failed to process SCORM package.' },
      { status: 500 }
    );
  }
}
