import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';

const COLLECTION = 'lesson_ratings';

export async function submitLessonRating(
  lessonId: string,
  studentId: string,
  rating: number
): Promise<void> {
  await addDoc(collection(firestore, COLLECTION), {
    lessonId,
    studentId,
    rating,
    createdAt: Timestamp.now()
  });
}

export async function hasStudentRatedLesson(
  lessonId: string,
  studentId: string
): Promise<boolean> {
  const q = query(
    collection(firestore, COLLECTION),
    where('lessonId', '==', lessonId),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function getLessonRatingStats(
  lessonId: string
): Promise<{ average: number; count: number }> {
  const q = query(
    collection(firestore, COLLECTION),
    where('lessonId', '==', lessonId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return { average: 0, count: 0 };

  const ratings = snapshot.docs.map(doc => doc.data().rating as number);
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  const average = Math.round((sum / ratings.length) * 10) / 10;

  return { average, count: ratings.length };
}
