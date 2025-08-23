import { inject, injectable } from 'inversify';
import { IScormContentRepository } from '../ScormContentRepository';
import { ScormContent } from '../../../core/entities';
import { Firestore } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import unzipper from 'unzipper';
import { PassThrough } from 'stream';

@injectable()
export class FirebaseAdminScormContentRepository
  implements IScormContentRepository
{
  private readonly firestore: Firestore;
  private readonly storage: Bucket;

  constructor(
    @inject('Firestore') firestore: Firestore,
    @inject('Storage') storage: Bucket
  ) {
    this.firestore = firestore;
    this.storage = storage;
  }

  async save(
    file: Buffer,
    content: Omit<ScormContent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScormContent> {
    const docRef = this.firestore.collection('scorm_content').doc();
    const newContent: ScormContent = {
      id: docRef.id,
      ...content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const zip = await unzipper.Open.buffer(file);

    const uploadPromises = zip.files.map((zipEntry) => {
      const filePath = `${content.storageBasePath}/${zipEntry.path}`;
      const file = this.storage.file(filePath);
      const stream = zipEntry.stream();
      const passthrough = new PassThrough();
      stream.pipe(passthrough);

      return new Promise((resolve, reject) => {
        const writeStream = file.createWriteStream();
        passthrough.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    });

    await Promise.all(uploadPromises);
    await docRef.set(newContent);

    return newContent;
  }

  async findById(id: string): Promise<ScormContent | null> {
    const doc = await this.firestore.collection('scorm_content').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    if (!data) {
      return null;
    }

    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as ScormContent;
  }
}
