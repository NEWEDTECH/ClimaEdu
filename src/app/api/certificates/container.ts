import 'reflect-metadata';
import { Container } from 'inversify';
import { Firestore } from 'firebase-admin/firestore';
import { Bucket } from '@google-cloud/storage';
import {
  getAdminFirestore,
  getAdminStorage,
} from '../../../_core/shared/firebase/firebase-admin';
import { PdfGeneratorService } from './services/PdfGeneratorService';
import { StorageService } from './services/StorageService';

const certificatesContainer = new Container();

const firestore = getAdminFirestore();
const storage = getAdminStorage();

certificatesContainer.bind<Firestore>('Firestore').toConstantValue(firestore);
certificatesContainer.bind<Bucket>('Storage').toConstantValue(storage.bucket());

certificatesContainer.bind<PdfGeneratorService>(PdfGeneratorService).toSelf();
certificatesContainer.bind<StorageService>(StorageService).toSelf();

export { certificatesContainer };