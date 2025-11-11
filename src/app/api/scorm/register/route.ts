import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminStorage } from '@/_core/shared/firebase/firebase-admin';
import { nanoid } from 'nanoid';
import { Timestamp } from 'firebase-admin/firestore';
import unzipper from 'unzipper';
import { PassThrough } from 'stream';

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 [SCORM Register] Starting registration process');
    
    const body = await req.json();
    console.log('📦 [SCORM Register] Request body received:', { name: body.name, institutionId: body.institutionId, storagePath: body.storagePath });
    
    const { name, institutionId, fileUrl, storagePath } = body;

    if (!name || !institutionId || !fileUrl || !storagePath) {
      console.log('❌ [SCORM Register] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: name, institutionId, fileUrl, storagePath' },
        { status: 400 }
      );
    }

    // Gerar ID único para o SCORM
    const scormId = `scm_${nanoid(10)}`;
    console.log('🆔 [SCORM Register] Generated SCORM ID:', scormId);

    // Download do arquivo do Storage
    console.log('🔧 [SCORM Register] Initializing Firebase Admin Storage');
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    console.log('📂 [SCORM Register] Bucket obtained, accessing file:', storagePath);
    
    const file = bucket.file(storagePath);
    
    console.log('⬇️ [SCORM Register] Starting file download from Storage');
    const [fileBuffer] = await file.download();
    console.log('✅ [SCORM Register] File downloaded successfully, size:', fileBuffer.length, 'bytes');

    // Descompactar e salvar arquivos
    const scormBasePath = `scorm_courses/${scormId}`;
    console.log('📦 [SCORM Register] Starting ZIP extraction, base path:', scormBasePath);
    
    const zip = await unzipper.Open.buffer(fileBuffer);
    console.log('✅ [SCORM Register] ZIP opened successfully, total files:', zip.files.length);

    let launchUrl = '';

    // Processar arquivos do ZIP
    console.log('📁 [SCORM Register] Processing ZIP files...');
    const uploadPromises = zip.files.map(async (zipEntry, index) => {
      const filePath = `${scormBasePath}/${zipEntry.path}`;
      console.log(`  📄 [${index + 1}/${zip.files.length}] Processing file:`, zipEntry.path);
      const storageFile = bucket.file(filePath);
      
      // Identificar o arquivo de manifesto para extrair launchUrl
      if (zipEntry.path.toLowerCase().includes('imsmanifest.xml')) {
        console.log('  📋 [SCORM Register] Found manifest file:', zipEntry.path);
        const content = await zipEntry.buffer();
        const manifestContent = content.toString();
        
        // Extrair href do manifesto (simplificado)
        const hrefMatch = manifestContent.match(/href="([^"]+)"/);
        if (hrefMatch) {
          // launchUrl deve ser relativo, sem scorm_courses/scormId
          launchUrl = hrefMatch[1];
          console.log('  🎯 [SCORM Register] Extracted launch URL:', launchUrl);
        }
      }

      // Upload do arquivo
      console.log(`  ⬆️ [SCORM Register] Uploading to Storage:`, filePath);
      const stream = zipEntry.stream();
      const passthrough = new PassThrough();
      stream.pipe(passthrough);

      return new Promise((resolve, reject) => {
        const writeStream = storageFile.createWriteStream();
        passthrough.pipe(writeStream);
        writeStream.on('finish', () => {
          console.log(`  ✅ [SCORM Register] File uploaded successfully:`, zipEntry.path);
          resolve(undefined);
        });
        writeStream.on('error', (err) => {
          console.error(`  ❌ [SCORM Register] Upload error for ${zipEntry.path}:`, err);
          reject(err);
        });
      });
    });

    console.log('⏳ [SCORM Register] Waiting for all uploads to complete...');
    await Promise.all(uploadPromises);
    console.log('✅ [SCORM Register] All files uploaded successfully');

    // Se não encontrou launchUrl, usa valor padrão
    if (!launchUrl) {
      console.log('⚠️ [SCORM Register] No launch URL found in manifest, using default: index.html');
      launchUrl = 'index.html';
    }

    // Deletar arquivo ZIP original
    console.log('🗑️ [SCORM Register] Deleting original ZIP file:', storagePath);
    await file.delete().catch(err => {
      console.warn('⚠️ [SCORM Register] Failed to delete original zip:', err);
    });
    console.log('✅ [SCORM Register] Original ZIP deleted');

    // Salvar metadados no Firestore
    console.log('💾 [SCORM Register] Saving metadata to Firestore');
    const firestore = getAdminFirestore();
    const now = Timestamp.now();

    const scormData = {
      id: scormId,
      name,
      institutionId,
      launchUrl,
      storageBasePath: scormBasePath,
      createdAt: now,
      updatedAt: now,
    };

    console.log('📝 [SCORM Register] SCORM data to save:', scormData);
    await firestore.collection('scorm_content').doc(scormId).set(scormData);
    console.log('✅ [SCORM Register] Metadata saved successfully');

    console.log('🎉 [SCORM Register] Registration completed successfully');
    return NextResponse.json({
      id: scormId,
      name,
      institutionId,
      launchUrl,
      storageBasePath: scormBasePath,
      message: 'SCORM registered successfully'
    });
  } catch (error) {
    console.error('❌❌❌ [SCORM Register] FATAL ERROR ❌❌❌');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
    } else {
      console.error('Non-Error object:', error);
    }
    
    // Se for um erro do Firebase/Google Cloud
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Firebase/GCP Error code:', (error as any).code);
      console.error('Firebase/GCP Error details:', (error as any).details);
    }
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Final error message to client:', message);
    
    return NextResponse.json(
      { error: message || 'Failed to register SCORM package.' },
      { status: 500 }
    );
  }
}
