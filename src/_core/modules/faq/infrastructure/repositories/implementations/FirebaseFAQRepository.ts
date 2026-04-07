import { injectable } from 'inversify';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { FAQ } from '../../../core/entities/FAQ';
import type { FAQRepository } from '../FAQRepository';
import { nanoid } from 'nanoid';

@injectable()
export class FirebaseFAQRepository implements FAQRepository {
  private readonly collectionName = 'faqs';
  private readonly idPrefix = 'faq_';

  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  private mapToEntity(data: DocumentData): FAQ {
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt);
    const updatedAt = data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt);

    return FAQ.create({
      id: data.id,
      institutionId: data.institutionId,
      title: data.title,
      content: data.content ?? '',
      createdAt,
      updatedAt
    });
  }

  async findById(id: string): Promise<FAQ | null> {
    const ref = doc(firestore, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return this.mapToEntity({ id, ...snap.data() });
  }

  async save(faq: FAQ): Promise<FAQ> {
    const ref = doc(firestore, this.collectionName, faq.id);
    const data = {
      id: faq.id,
      institutionId: faq.institutionId,
      title: faq.title,
      content: faq.content,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt
    };

    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, data);
    } else {
      await setDoc(ref, data);
    }
    return faq;
  }

  async delete(id: string): Promise<boolean> {
    const ref = doc(firestore, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    await deleteDoc(ref);
    return true;
  }

  async listByInstitution(institutionId: string): Promise<FAQ[]> {
    const q = query(
      collection(firestore, this.collectionName),
      where('institutionId', '==', institutionId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => this.mapToEntity({ id: d.id, ...d.data() }));
  }
}
