export interface IMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

export interface IConversation {
  userId: string;
  messages: IMessage[];
  sessionStart: Date;
  sessionEnd?: Date;
  summary?: string;
}