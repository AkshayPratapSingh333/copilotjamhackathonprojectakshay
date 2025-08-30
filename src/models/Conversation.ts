import { Schema, model, models } from 'mongoose';
import { IConversation, IMessage } from '@/types/database';

const messageSchema = new Schema<IMessage>({
  role: { type: String, required: true, enum: ['user', 'ai', 'system'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true },
  messages: [messageSchema],
  sessionStart: { type: Date, default: Date.now },
  sessionEnd: Date,
  summary: String
});

export default models.Conversation || model<IConversation>('Conversation', conversationSchema);