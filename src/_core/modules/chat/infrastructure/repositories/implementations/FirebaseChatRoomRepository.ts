import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore } from "@/_core/shared/firebase/firebase-client";
import { nanoid } from "nanoid";
import { ChatRoom } from "../../../core/entities/ChatRoom";
import { ChatMessage } from "../../../core/entities/ChatMessage";
import { ChatParticipant } from "../../../core/entities/ChatParticipant";
import { ChatRoomRepository } from "../ChatRoomRepository";

// Mappers would go here if the domain and persistence models were different.
// For simplicity, we'll use the domain entities directly as the persistence model.

export class FirebaseChatRoomRepository implements ChatRoomRepository {
  private readonly collection = collection(firestore, "chatRooms");
  private readonly idPrefix = "chat_";

  public async generateId(): Promise<string> {
    return `${this.idPrefix}${nanoid(10)}`;
  }

  public async save(chatRoom: ChatRoom): Promise<void> {
    const docRef = doc(this.collection, chatRoom.id);
    await setDoc(docRef, {
      classId: chatRoom.classId,
      courseId: chatRoom.courseId,
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt,
    });
  }

  public async findById(id: string): Promise<ChatRoom | null> {
    const docRef = doc(this.collection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return ChatRoom.from({
      id: docSnap.id,
      classId: data.classId,
      courseId: data.courseId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
  }

  public async findByClassAndCourse(
    classId: string,
    courseId: string
  ): Promise<ChatRoom | null> {
    const q = query(
      this.collection,
      where("classId", "==", classId),
      where("courseId", "==", courseId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return ChatRoom.from({
      id: docSnap.id,
      classId: data.classId,
      courseId: data.courseId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
  }

  public async addMessage(
    chatRoomId: string,
    message: ChatMessage
  ): Promise<void> {
    const docRef = doc(this.collection, chatRoomId);
    await updateDoc(docRef, {
      messages: arrayUnion({
        id: message.id,
        userId: message.userId,
        text: message.text,
        sentAt: message.sentAt,
      }),
    });
  }

  public async addParticipant(
    chatRoomId: string,
    participant: ChatParticipant
  ): Promise<void> {
    const docRef = doc(this.collection, chatRoomId);
    await updateDoc(docRef, {
      participants: arrayUnion({
        id: participant.id,
        userId: participant.userId,
        joinedAt: participant.joinedAt,
      }),
    });
  }

  public async removeParticipant(
    chatRoomId: string,
    userId: string
  ): Promise<void> {
    const docRef = doc(this.collection, chatRoomId);
    const chatRoom = await this.findById(chatRoomId);
    if (chatRoom) {
      const participants = await this.getParticipants(chatRoomId);
      const participantToRemove = participants.find((p) => p.userId === userId);
      if (participantToRemove) {
        await updateDoc(docRef, {
          participants: arrayRemove(participantToRemove),
        });
      }
    }
  }

  public async getMessages(chatRoomId: string): Promise<ChatMessage[]> {
    const docRef = doc(this.collection, chatRoomId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    const data = docSnap.data();
    return (data.messages || []).map((m: any) =>
      ChatMessage.from({
        id: m.id,
        chatRoomId: chatRoomId,
        userId: m.userId,
        text: m.text,
        sentAt: m.sentAt?.toDate ? m.sentAt.toDate() : new Date(m.sentAt),
      })
    );
  }

  public async getParticipants(
    chatRoomId: string
  ): Promise<ChatParticipant[]> {
    const docRef = doc(this.collection, chatRoomId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return [];
    }

    const data = docSnap.data();
    return (data.participants || []).map((p: any) =>
      ChatParticipant.from({
        id: p.id,
        chatRoomId: chatRoomId,
        userId: p.userId,
        joinedAt: p.joinedAt?.toDate ? p.joinedAt.toDate() : new Date(p.joinedAt),
      })
    );
  }
}
