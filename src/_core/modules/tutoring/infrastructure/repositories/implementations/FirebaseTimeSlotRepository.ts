import { injectable } from 'inversify';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { firestore } from '@/_core/shared/firebase/firebase-client';
import { TimeSlot, DayOfWeek } from '../../../core/entities/TimeSlot';
import type { 
  TimeSlotRepository, 
  AvailabilitySummary, 
  WeeklyAvailability, 
  TimeSlotStats,
  DaySlotCount 
} from '../TimeSlotRepository';

/**
 * Firebase implementation of TimeSlotRepository
 * Following Clean Architecture principles, this implementation handles persistence
 * without affecting the domain layer
 */
@injectable()
export class FirebaseTimeSlotRepository implements TimeSlotRepository {
  private readonly collectionName = 'tutor-time-slots';

  /**
   * Generates a unique ID for a new time slot
   */
  async generateId(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `tsl_${timestamp}_${random}`;
  }

  /**
   * Saves a time slot to Firestore
   */
  async save(timeSlot: TimeSlot): Promise<TimeSlot> {
    const docRef = doc(firestore, this.collectionName, timeSlot.id);
    const data = this.toFirestoreData(timeSlot);
    
    await setDoc(docRef, data);
    return timeSlot;
  }

  /**
   * Finds a time slot by its ID
   */
  async findById(id: string): Promise<TimeSlot | null> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return this.fromFirestoreData(docSnap.id, docSnap.data());
  }

  /**
   * Finds all time slots for a specific tutor
   */
  async findByTutorId(tutorId: string, activeOnly = false): Promise<TimeSlot[]> {
    let q = query(
      collection(firestore, this.collectionName),
      where('tutorId', '==', tutorId),
      orderBy('dayOfWeek'),
      orderBy('startTime')
    );

    if (activeOnly) {
      q = query(q, where('isAvailable', '==', true));
    }

    const querySnapshot = await getDocs(q);
    const timeSlots: TimeSlot[] = [];

    querySnapshot.forEach((doc) => {
      const timeSlot = this.fromFirestoreData(doc.id, doc.data());
      if (!activeOnly || timeSlot.isCurrentlyActive()) {
        timeSlots.push(timeSlot);
      }
    });

    return timeSlots;
  }

  /**
   * Finds time slots for a specific tutor and day of week
   */
  async findByTutorAndDay(
    tutorId: string,
    dayOfWeek: DayOfWeek,
    activeOnly = false
  ): Promise<TimeSlot[]> {
    let q = query(
      collection(firestore, this.collectionName),
      where('tutorId', '==', tutorId),
      where('dayOfWeek', '==', dayOfWeek),
      orderBy('startTime')
    );

    if (activeOnly) {
      q = query(q, where('isAvailable', '==', true));
    }

    const querySnapshot = await getDocs(q);
    const timeSlots: TimeSlot[] = [];

    querySnapshot.forEach((doc) => {
      const timeSlot = this.fromFirestoreData(doc.id, doc.data());
      if (!activeOnly || timeSlot.isCurrentlyActive()) {
        timeSlots.push(timeSlot);
      }
    });

    return timeSlots;
  }

  /**
   * Finds available time slots for a specific tutor within a time range
   */
  async findAvailableInTimeRange(
    tutorId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string
  ): Promise<TimeSlot[]> {
    const timeSlots = await this.findByTutorAndDay(tutorId, dayOfWeek, true);
    
    return timeSlots.filter(slot => {
      return slot.containsTime(startTime) || 
             slot.containsTime(endTime) ||
             (slot.startTime <= startTime && slot.endTime >= endTime);
    });
  }

  /**
   * Finds overlapping time slots for a tutor
   */
  async findOverlapping(
    tutorId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<TimeSlot[]> {
    const timeSlots = await this.findByTutorAndDay(tutorId, dayOfWeek);
    
    return timeSlots.filter(slot => {
      if (excludeId && slot.id === excludeId) {
        return false;
      }
      
      const testSlot = TimeSlot.create({
        id: 'temp',
        tutorId,
        dayOfWeek,
        startTime,
        endTime
      });
      
      return slot.overlapsWith(testSlot);
    });
  }

  /**
   * Finds all active time slots across all tutors
   */
  async findAllActive(dayOfWeek?: DayOfWeek): Promise<TimeSlot[]> {
    let q = query(
      collection(firestore, this.collectionName),
      where('isAvailable', '==', true)
    );

    if (dayOfWeek !== undefined) {
      q = query(q, where('dayOfWeek', '==', dayOfWeek));
    }

    q = query(q, orderBy('tutorId'), orderBy('dayOfWeek'), orderBy('startTime'));

    const querySnapshot = await getDocs(q);
    const timeSlots: TimeSlot[] = [];

    querySnapshot.forEach((doc) => {
      const timeSlot = this.fromFirestoreData(doc.id, doc.data());
      if (timeSlot.isCurrentlyActive()) {
        timeSlots.push(timeSlot);
      }
    });

    return timeSlots;
  }

  /**
   * Finds expired time slots (past recurrence end date)
   */
  async findExpired(tutorId?: string): Promise<TimeSlot[]> {
    let q = query(collection(firestore, this.collectionName));

    if (tutorId) {
      q = query(q, where('tutorId', '==', tutorId));
    }

    const querySnapshot = await getDocs(q);
    const expiredSlots: TimeSlot[] = [];

    querySnapshot.forEach((doc) => {
      const timeSlot = this.fromFirestoreData(doc.id, doc.data());
      if (timeSlot.recurrenceEndDate && timeSlot.recurrenceEndDate <= new Date()) {
        expiredSlots.push(timeSlot);
      }
    });

    return expiredSlots;
  }

  /**
   * Gets tutor availability summary for a specific day
   */
  async getTutorAvailability(tutorId: string, dayOfWeek: DayOfWeek): Promise<AvailabilitySummary> {
    const timeSlots = await this.findByTutorAndDay(tutorId, dayOfWeek);
    
    const availableSlots = timeSlots.filter(slot => slot.isCurrentlyActive());
    const unavailableSlots = timeSlots.filter(slot => !slot.isCurrentlyActive());
    
    const totalHours = timeSlots.reduce((sum, slot) => sum + slot.getDurationInHours(), 0);
    const availableHours = availableSlots.reduce((sum, slot) => sum + slot.getDurationInHours(), 0);

    return {
      dayOfWeek,
      totalSlots: timeSlots.length,
      availableSlots: availableSlots.length,
      unavailableSlots: unavailableSlots.length,
      totalHours,
      availableHours,
      timeSlots
    };
  }

  /**
   * Gets tutor's weekly availability summary
   */
  async getWeeklyAvailability(tutorId: string): Promise<WeeklyAvailability> {
    const dailyAvailability: AvailabilitySummary[] = [];
    let totalWeeklyHours = 0;
    let availableWeeklyHours = 0;

    for (let day = 0; day <= 6; day++) {
      const dayAvailability = await this.getTutorAvailability(tutorId, day as DayOfWeek);
      dailyAvailability.push(dayAvailability);
      totalWeeklyHours += dayAvailability.totalHours;
      availableWeeklyHours += dayAvailability.availableHours;
    }

    return {
      tutorId,
      totalWeeklyHours,
      availableWeeklyHours,
      dailyAvailability
    };
  }

  /**
   * Finds tutors available at a specific time
   */
  async findAvailableTutorsAtTime(dayOfWeek: DayOfWeek, time: string): Promise<string[]> {
    const activeSlots = await this.findAllActive(dayOfWeek);
    const availableTutors = new Set<string>();

    activeSlots.forEach(slot => {
      if (slot.containsTime(time)) {
        availableTutors.add(slot.tutorId);
      }
    });

    return Array.from(availableTutors);
  }

  /**
   * Gets time slot statistics for a tutor
   */
  async getTimeSlotStats(tutorId: string): Promise<TimeSlotStats> {
    const timeSlots = await this.findByTutorId(tutorId);
    
    const activeSlots = timeSlots.filter(slot => slot.isCurrentlyActive());
    const inactiveSlots = timeSlots.filter(slot => !slot.isCurrentlyActive());
    const expiredSlots = timeSlots.filter(slot => 
      slot.recurrenceEndDate && slot.recurrenceEndDate <= new Date()
    );

    const totalWeeklyHours = timeSlots.reduce((sum, slot) => sum + slot.getDurationInHours(), 0);
    const averageSlotDuration = timeSlots.length > 0 
      ? timeSlots.reduce((sum, slot) => sum + slot.getDurationInMinutes(), 0) / timeSlots.length
      : 0;

    const slotsByDay: DaySlotCount[] = [];
    for (let day = 0; day <= 6; day++) {
      const daySlots = timeSlots.filter(slot => slot.dayOfWeek === day);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      slotsByDay.push({
        dayOfWeek: day as DayOfWeek,
        dayName: dayNames[day],
        count: daySlots.length,
        totalHours: daySlots.reduce((sum, slot) => sum + slot.getDurationInHours(), 0)
      });
    }

    return {
      totalSlots: timeSlots.length,
      activeSlots: activeSlots.length,
      inactiveSlots: inactiveSlots.length,
      expiredSlots: expiredSlots.length,
      totalWeeklyHours,
      averageSlotDuration,
      slotsByDay
    };
  }

  /**
   * Bulk saves multiple time slots
   */
  async bulkSave(timeSlots: TimeSlot[]): Promise<TimeSlot[]> {
    const batch = writeBatch(firestore);

    timeSlots.forEach(timeSlot => {
      const docRef = doc(firestore, this.collectionName, timeSlot.id);
      const data = this.toFirestoreData(timeSlot);
      batch.set(docRef, data);
    });

    await batch.commit();
    return timeSlots;
  }

  /**
   * Deletes a time slot
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }

  /**
   * Deletes all time slots for a tutor
   */
  async deleteByTutorId(tutorId: string): Promise<void> {
    const timeSlots = await this.findByTutorId(tutorId);
    const batch = writeBatch(firestore);

    timeSlots.forEach(timeSlot => {
      const docRef = doc(firestore, this.collectionName, timeSlot.id);
      batch.delete(docRef);
    });

    await batch.commit();
  }

  /**
   * Checks if a time slot exists
   */
  async exists(id: string): Promise<boolean> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }

  /**
   * Converts TimeSlot entity to Firestore data
   */
  private toFirestoreData(timeSlot: TimeSlot): DocumentData {
    return {
      tutorId: timeSlot.tutorId,
      dayOfWeek: timeSlot.dayOfWeek,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      isAvailable: timeSlot.isAvailable,
      createdAt: Timestamp.fromDate(timeSlot.createdAt),
      updatedAt: Timestamp.fromDate(timeSlot.updatedAt),
      recurrenceEndDate: timeSlot.recurrenceEndDate 
        ? Timestamp.fromDate(timeSlot.recurrenceEndDate) 
        : null
    };
  }

  /**
   * Converts Firestore data to TimeSlot entity
   */
  private fromFirestoreData(id: string, data: DocumentData): TimeSlot {
    return TimeSlot.create({
      id,
      tutorId: data.tutorId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      recurrenceEndDate: data.recurrenceEndDate?.toDate()
    });
  }
}
