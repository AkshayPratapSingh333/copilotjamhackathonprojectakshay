import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConversationChain } from 'langchain/chains';
import { BufferWindowMemory } from 'langchain/memory';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { dbConnect } from './mongodb';
import mongoose from 'mongoose';
import { Collection } from 'mongodb'; // Import the Collection type

export async function createConversationChain(sessionId: string, userId: string) {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    maxOutputTokens: 2048,
    temperature: 0.7,
    apiKey: process.env.GEMINI_API_KEY!,
  });

  // Connect to MongoDB
  const mongooseInstance = await dbConnect();

  // Assert that .db is not null and cast the collection type
  const collection = mongooseInstance.connection.db!.collection('chat_histories') as unknown as Collection;

  const chatHistory = new MongoDBChatMessageHistory({
    sessionId,
    collection,
  });

  const memory = new BufferWindowMemory({
    k: 10,
    chatHistory,
    returnMessages: true,
    memoryKey: 'history',
    inputKey: 'input',
  });

  const chain = new ConversationChain({
    llm: model,
    memory,
  });

  return chain;
}