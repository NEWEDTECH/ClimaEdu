import { ChatParticipant } from "../../entities/ChatParticipant";

export class AddParticipantOutput {
  constructor(public readonly participant: ChatParticipant) {}
}
