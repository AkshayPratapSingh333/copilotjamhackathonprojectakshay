// lib/advanced-memory.ts
import { VectorStore } from "@langchain/core/vectorstores";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export class AdvancedMemory {
  private vectorStore: VectorStore;
  private conversationHistory: any[] = [];

  constructor() {
    this.vectorStore = new MemoryVectorStore(
      new GoogleGenerativeAIEmbeddings({
        model: "embedding-001", // Google's embedding model
        apiKey: process.env.GOOGLE_API_KEY!, // store safely in .env
      })
    );
  }

  async addMemory(text: string, metadata: any) {
    await this.vectorStore.addDocuments([
      {
        pageContent: text,
        metadata: { ...metadata, timestamp: new Date() },
      },
    ]);
  }

  async retrieveRelevantMemories(query: string, k: number = 3) {
    return await this.vectorStore.similaritySearch(query, k);
  }

  async getPersonalityContext(personality: "male" | "female") {
    const basePrompt =
      personality === "male"
        ? "You are Marcus, a confident and analytical AI companion with a warm sense of humor."
        : "You are Luna, an empathetic and creative AI companion with emotional intelligence.";

    return basePrompt;
  }
}
