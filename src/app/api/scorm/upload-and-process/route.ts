import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/_core/shared/firebase/firebase-admin';
import { scormContainer } from '../container';
import { UploadScormContentUseCase } from '@/_core/modules/content/core/use-cases/upload-scorm-content/upload-scorm-content.use-case';

/**
 * API simplificada que processa um SCORM já enviado ao Storage
 * Usa o caso de uso existente UploadScormContentUseCase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, institutionId, storagePath } = body;

    if (!name || !institutionId || !storagePath) {
      return NextResponse.json(
        { error: 'Missing required fields: name, institutionId, storagePath' },
        { status: 400 }
      );
    }

    // 1. Baixar o arquivo do Storage
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    
    console.log(`📥 Downloading SCORM from Storage: ${storagePath}`);
    const [fileBuffer] = await file.download();

    // 2. Usar o caso de uso existente para processar
    console.log(`🔄 Processing SCORM using UploadScormContentUseCase`);
    const uploadUseCase = scormContainer.get(UploadScormContentUseCase);
    const result = await uploadUseCase.execute({
      file: fileBuffer,
      name,
      institutionId,
    });

    // 3. Deletar o ZIP original do Storage (já foi processado)
    console.log(`🗑️ Deleting original ZIP: ${storagePath}`);
    await file.delete().catch(err => {
      console.warn('Failed to delete original zip:', err);
    });

    console.log(`✅ SCORM processed successfully: ${result.id}`);
    
    return NextResponse.json({
      id: result.id,
      name,
      institutionId,
      message: 'SCORM uploaded and processed successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ SCORM Upload Error:', error);
    return NextResponse.json(
      { error: message || 'Failed to process SCORM package.' },
      { status: 500 }
    );
  }
}
