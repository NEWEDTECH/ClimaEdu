import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '../../../../../../_core/shared/firebase/firebase-admin';
import { lookup } from 'mime-types';
import { Readable } from 'stream';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; filePath: string[] }> }
) {
  try {
    const { id: courseId, filePath } = await params;
    const fullPath = filePath.join('/');

    const storage = getAdminStorage();
    const bucket = storage.bucket();

    const file = bucket.file(`scorm_courses/${courseId}/${fullPath}`);
    const [exists] = await file.exists();

    if (!exists) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const stream = file.createReadStream();
    const contentType = lookup(fullPath) || 'application/octet-stream';

    const body = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('SCORM File Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
