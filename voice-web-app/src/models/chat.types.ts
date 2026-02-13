export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VoiceChatResponse {
  userTranscript: string;
  assistantResponse: string;
  error?: string;
}
