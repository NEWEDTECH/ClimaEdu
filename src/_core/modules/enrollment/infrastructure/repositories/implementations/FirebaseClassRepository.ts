import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/_core/shared/firebase/firebase-client";
import { nanoid } from "nanoid";
import { Class } from "../../../core/entities/Class";
import { ClassRepository } from "../ClassRepository";

interface ClassDocument {
  id: string;
  institutionId: string;
  name: string;
  courseId: string | null;
  trailId: string | null;
  enrollmentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

class ClassMapper {
  public static toDomain(doc: ClassDocument): Class {
    return Class.from({
      id: doc.id,
      institutionId: doc.institutionId,
      name: doc.name,
      courseId: doc.courseId,
      trailId: doc.trailId,
      enrollmentIds: doc.enrollmentIds,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  public static toPersistence(klass: Class): ClassDocument {
    return {
      id: klass.id,
      institutionId: klass.institutionId,
      name: klass.name,
      courseId: klass.courseId,
      trailId: klass.trailId,
      enrollmentIds: klass.enrollmentIds,
      createdAt: klass.createdAt,
      updatedAt: klass.updatedAt,
    };
  }
}

export class FirebaseClassRepository implements ClassRepository {
  private readonly collection = collection(firestore, "classes");
  private readonly idPrefix = "cls_";

  public async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  public async save(klass: Class): Promise<void> {
    const classDoc = ClassMapper.toPersistence(klass);
    const docRef = doc(this.collection, klass.id);
    await setDoc(docRef, classDoc);
  }

  public async findById(id: string): Promise<Class | null> {
    const docRef = doc(this.collection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return ClassMapper.toDomain(docSnap.data() as ClassDocument);
  }

  public async findAll(institutionId: string): Promise<Class[]> {
    const q = query(
      this.collection,
      where("institutionId", "==", institutionId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      ClassMapper.toDomain(doc.data() as ClassDocument)
    );
  }

  public async delete(id: string): Promise<void> {
    const docRef = doc(this.collection, id);
    await deleteDoc(docRef);
  }
}
