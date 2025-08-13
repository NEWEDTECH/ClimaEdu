/**
 * Input for AddSessionNotesUseCase
 */
export interface AddSessionNotesInput {
  sessionId: string;
  tutorId: string;
  notes: string;
}
