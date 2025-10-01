/**
 * Input for GetSessionDetailsUseCase
 */
export interface GetSessionDetailsInput {
  sessionId: string;
  userId: string; // Can be student or tutor ID for authorization
}
