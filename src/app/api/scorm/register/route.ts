import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminStorage } from '@/_core/shared/firebase/firebase-admin';
import { nanoid } from 'nanoid';
import { Timestamp } from 'firebase-admin/firestore';
import unzipper from 'unzipper';
import { PassThrough } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, institutionId, fileUrl, storagePath } = body;

    if (!name || !institutionId || !fileUrl || !storagePath) {
      return NextResponse.json(
        { error: 'Missing required fields: name, institutionId, fileUrl, storagePath' },
        { status: 400 }
      );
    }

    // Gerar ID único para o SCORM
    const scormId = `scm_${nanoid(10)}`;

    // Download do arquivo do Storage
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    
    const [fileBuffer] = await file.download();

    // Descompactar e salvar arquivos
    const scormBasePath = `scorm_courses/${scormId}`;
    const zip = await unzipper.Open.buffer(fileBuffer);

    let launchUrl = '';

    // Processar arquivos do ZIP
    const uploadPromises = zip.files.map(async (zipEntry) => {
      const filePath = `${scormBasePath}/${zipEntry.path}`;
      const storageFile = bucket.file(filePath);
      
      // Identificar o arquivo de manifesto para extrair launchUrl
      if (zipEntry.path.toLowerCase().includes('imsmanifest.xml')) {
        const content = await zipEntry.buffer();
        const manifestContent = content.toString();
        
        // Extrair href do manifesto (simplificado)
        const hrefMatch = manifestContent.match(/href="([^"]+)"/);
        if (hrefMatch) {
          // launchUrl deve ser relativo, sem scorm_courses/scormId
          launchUrl = hrefMatch[1];
        }
      }

      // Upload do arquivo
      const stream = zipEntry.stream();
      const passthrough = new PassThrough();
      stream.pipe(passthrough);

      return new Promise((resolve, reject) => {
        const writeStream = storageFile.createWriteStream();
        passthrough.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    });

    await Promise.all(uploadPromises);

    // Se não encontrou launchUrl, usa valor padrão
    if (!launchUrl) {
      launchUrl = 'index.html';
    }

    // Deletar arquivo ZIP original
    await file.delete().catch(err => {
      console.warn('Failed to delete original zip:', err);
    });

    // Salvar metadados no Firestore
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

    await firestore.collection('scorm_content').doc(scormId).set(scormData);

    return NextResponse.json({
      id: scormId,
      name,
      institutionId,
      launchUrl,
      storageBasePath: scormBasePath,
      message: 'SCORM registered successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('SCORM Register Error:', error);
    return NextResponse.json(
      { error: message || 'Failed to register SCORM package.' },
      { status: 500 }
    );
  }
}
