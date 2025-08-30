// lib/gemini.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

export class AIBrain {
  private model: ChatGoogleGenerativeAI;
  private memory: BufferMemory;
  private chain: ConversationChain;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "models/gemini-2.0-flash", // Changed from modelName to model
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.7,
    });

    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
    });

    this.chain = new ConversationChain({
      llm: this.model,
      memory: this.memory,
    });
  }

  async generateResponse(input: string, personality: 'male' | 'female') {
    const prompt = `
    You are a ${personality} AI companion with human-like emotions and expressions.
    Respond naturally and expressively. Include emotion indicators in your response.
    
    Format your response as JSON:
    {
      "text": "your response",
      "emotion": "happy|sad|excited|neutral|surprised|thoughtful",
      "intensity": 0.1-1.0
    }
    
    User: ${input}
    `;

    try {
      const response = await this.chain.call({ input: prompt });
      // Parse JSON response or create default structure
      try {
        return JSON.parse(response.response);
      } catch {
        return {
          text: response.response,
          emotion: "neutral",
          intensity: 0.5
        };
      }
    } catch (error) {
      console.error('AI response error:', error);
      return {
        text: "I'm sorry, I'm having trouble processing that right now.",
        emotion: "neutral",
        intensity: 0.5
      };
    }
  }
}