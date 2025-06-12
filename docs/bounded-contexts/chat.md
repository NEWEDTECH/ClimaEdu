# Bounded Context: Chat

## Context Explanation

The **Chat** bounded context is responsible for managing real-time communication between students and tutors within the platform.

Each **Class** has a dedicated **ChatRoom**, ensuring that conversations are private and relevant to the participants of that class.

Hierarchy of data:

```plaintext
Institution
  └── Class
       └── ChatRoom
            ├── ChatParticipant
            └── ChatMessage
```

---

## Entities and Responsibilities

| Entity             | Responsibility |
|:-------------------|:----------------|
| **ChatRoom**       | Represents a chat room for a specific class. |
| **ChatMessage**    | Represents a single message sent in a chat room. |
| **ChatParticipant**| Represents a user's participation in a chat room. |

---

## Key Attributes (Functional Description)

- **ChatRoom.classId**: Links the chat room to a specific class.
- **ChatRoom.courseId**: Links the chat room to a specific course.
- **ChatMessage.userId**: Links the message to the user who sent it.
- **ChatMessage.text**: The content of the message.
- **ChatParticipant.userId**: Links the participant to a user.

---

## Use Cases

| Use Case | Description |
|:---------|:------------|
| **CreateChatRoomForClass** | Creates a new chat room for a class. |
| **SendMessage** | Sends a message to a chat room. |
| **ListMessages** | Lists all messages in a chat room. |
| **AddParticipant** | Adds a user to a chat room. |
| **RemoveParticipant** | Removes a user from a chat room. |
| **GetChatRoomByClass** | Retrieves the chat room for a specific class and course. |

---

## Business Rules

- A user must be a participant of a chat room to send or receive messages.
- Only members of a class (students and tutors) can be participants in the class's chat room.
