import { injectable } from 'inversify'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore'
import { firestore } from '@/_core/shared/firebase/firebase-client'
import { Notification } from '../../../core/entities/Notification'
import type { NotificationRepository, Unsubscribe } from '../NotificationRepository'
import { nanoid } from 'nanoid'

@injectable()
export class FirebaseNotificationRepository implements NotificationRepository {
  private readonly collectionName = 'notifications'
  private readonly idPrefix = 'ntf_'

  async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`
  }

  private mapToEntity(data: DocumentData): Notification {
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date(data.createdAt)

    return new Notification(
      data.id,
      data.recipientId,
      data.senderId,
      data.senderName,
      data.type,
      data.title,
      data.message,
      data.read ?? false,
      data.relatedEntityId,
      data.response ?? null,
      createdAt
    )
  }

  async findById(id: string): Promise<Notification | null> {
    const ref = doc(firestore, this.collectionName, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return this.mapToEntity({ id, ...snap.data() })
  }

  async save(notification: Notification): Promise<Notification> {
    const ref = doc(firestore, this.collectionName, notification.id)
    const data = {
      id: notification.id,
      recipientId: notification.recipientId,
      senderId: notification.senderId,
      senderName: notification.senderName,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      relatedEntityId: notification.relatedEntityId,
      response: notification.response,
      createdAt: notification.createdAt
    }

    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, data)
    } else {
      await setDoc(ref, data)
    }
    return notification
  }

  subscribeByRecipient(
    recipientId: string,
    onUpdate: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(firestore, this.collectionName),
      where('recipientId', '==', recipientId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (snap) => {
      const notifications = snap.docs.map(d =>
        this.mapToEntity({ id: d.id, ...d.data() })
      )
      onUpdate(notifications)
    })
  }
}
