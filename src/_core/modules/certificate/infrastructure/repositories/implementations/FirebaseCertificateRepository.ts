import { injectable } from 'inversify';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where, DocumentData } from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { CertificateRepository } from '../CertificateRepository';
import { Certificate } from '../../../core/entities/Certificate';

@injectable()
export class FirebaseCertificateRepository implements CertificateRepository {
  private readonly collectionName = 'certificates';

  private mapToEntity(data: DocumentData): Certificate {
    return Certificate.create({
      id: data.id,
      userId: data.userId,
      courseId: data.courseId,
      institutionId: data.institutionId,
      issuedAt: data.issuedAt.toDate(), // Convert Firestore Timestamp to Date
      certificateNumber: data.certificateNumber,
      certificateUrl: data.certificateUrl,
    });
  }

  private getCollection() {
    return collection(firestore, this.collectionName);
  }

  async generateId(): Promise<string> {
    return doc(this.getCollection()).id;
  }

  async findById(id: string): Promise<Certificate | null> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return this.mapToEntity({ id: docSnap.id, ...docSnap.data() });
  }

  async save(certificate: Certificate): Promise<Certificate> {
    const docRef = doc(firestore, this.collectionName, certificate.id);
    const plainObject = {
      id: certificate.id,
      userId: certificate.userId,
      courseId: certificate.courseId,
      institutionId: certificate.institutionId,
      issuedAt: certificate.issuedAt,
      certificateNumber: certificate.certificateNumber,
      certificateUrl: certificate.certificateUrl,
    };
    await setDoc(docRef, plainObject);
    return certificate;
  }

  async delete(id: string): Promise<boolean> {
    const docRef = doc(firestore, this.collectionName, id);
    await deleteDoc(docRef);
    return true;
  }

  async listByUser(userId: string): Promise<Certificate[]> {
    const q = query(this.getCollection(), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToEntity({ id: doc.id, ...doc.data() }));
  }

  async listByCourse(courseId: string): Promise<Certificate[]> {
    const q = query(this.getCollection(), where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToEntity({ id: doc.id, ...doc.data() }));
  }

  async listByInstitution(institutionId: string): Promise<Certificate[]> {
    const q = query(this.getCollection(), where('institutionId', '==', institutionId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToEntity({ id: doc.id, ...doc.data() }));
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Certificate | null> {
    const q = query(
      this.getCollection(),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return this.mapToEntity({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
  }
}
