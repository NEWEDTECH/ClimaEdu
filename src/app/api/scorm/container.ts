import 'reflect-metadata';
import { Container } from 'inversify';
import { IScormContentRepository } from '../../../_core/modules/content/infrastructure/repositories/ScormContentRepository';
import { FirebaseAdminScormContentRepository } from '../../../_core/modules/content/infrastructure/repositories/implementations/FirebaseAdminScormContentRepository';
import { UploadScormContentUseCase } from '../../../_core/modules/content/core/use-cases/upload-scorm-content/upload-scorm-content.use-case';
import { GetScormContentUseCase } from '../../../_core/modules/content/core/use-cases/get-scorm-content/get-scorm-content.use-case';
import { Firestore } from 'firebase-admin/firestore';
import {
  getAdminFirestore,
  getAdminStorage,
} from '../../../_core/shared/firebase/firebase-admin';
import { Bucket } from '@google-cloud/storage';

const scormContainer = new Container();

const firestore = getAdminFirestore();
const storage = getAdminStorage();

scormContainer.bind<Firestore>('Firestore').toConstantValue(firestore);
scormContainer.bind<Bucket>('Storage').toConstantValue(storage.bucket());

scormContainer
  .bind<IScormContentRepository>('IScormContentRepository')
  .to(FirebaseAdminScormContentRepository);

scormContainer
  .bind<UploadScormContentUseCase>(UploadScormContentUseCase)
  .toSelf();
scormContainer
  .bind<GetScormContentUseCase>(GetScormContentUseCase)
  .toSelf();

export { scormContainer };
