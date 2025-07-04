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
import { Trail } from "../../../core/entities/Trail";
import { TrailRepository } from "../TrailRepository";

interface TrailDocument {
  id: string;
  institutionId: string;
  title: string;
  description: string;
  courseIds: string[];
  coverImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

class TrailMapper {
  public static toDomain(doc: TrailDocument): Trail {
    return Trail.from({
      id: doc.id,
      institutionId: doc.institutionId,
      title: doc.title,
      description: doc.description,
      courseIds: doc.courseIds,
      coverImageUrl: doc.coverImageUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  public static toPersistence(trail: Trail): TrailDocument {
    return {
      id: trail.id,
      institutionId: trail.institutionId,
      title: trail.title,
      description: trail.description,
      courseIds: trail.courseIds,
      coverImageUrl: trail.coverImageUrl,
      createdAt: trail.createdAt,
      updatedAt: trail.updatedAt,
    };
  }
}

export class FirebaseTrailRepository implements TrailRepository {
  private readonly collection = collection(firestore, "trails");
  private readonly idPrefix = "trl_";

  public async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  public async save(trail: Trail): Promise<void> {
    const trailDoc = TrailMapper.toPersistence(trail);
    const docRef = doc(this.collection, trail.id);
    await setDoc(docRef, trailDoc);
  }

  public async findById(id: string): Promise<Trail | null> {
    const docRef = doc(this.collection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return TrailMapper.toDomain(docSnap.data() as TrailDocument);
  }

  public async findAll(institutionId: string): Promise<Trail[]> {
    const q = query(this.collection, where("institutionId", "==", institutionId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      TrailMapper.toDomain(doc.data() as TrailDocument)
    );
  }

  public async delete(id: string): Promise<void> {
    const docRef = doc(this.collection, id);
    await deleteDoc(docRef);
  }
}
