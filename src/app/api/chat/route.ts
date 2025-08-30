import { NextRequest, NextResponse } from 'next/server';
import { createConversationChain } from '@/lib/langchain';

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId } = await req.json();

    if (!message || !sessionId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create conversation chain
    const chain = await createConversationChain(sessionId, userId);

    // Get AI response
    const response = await chain.call({
      input: message
    });

    // Generate expression data based on response
    const expressionData = generateExpressionData(response.response);

    return NextResponse.json({
      response: response.response,
      expressionData
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateExpressionData(text: string): any {
  // Simple sentiment analysis for expression mapping
  const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excellent', 'love', 'like'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike'];
  const surpriseWords = ['wow', 'amazing', 'unbelievable', 'incredible', 'surprising'];

  const words = text.toLowerCase().split(/\s+/);
  const expressions: any = {};

  // Calculate expression values based on word presence
  if (words.some(word => positiveWords.includes(word))) {
    expressions.smile = 0.8;
    expressions.blink = 0.5;
  }

  if (words.some(word => negativeWords.includes(word))) {
    expressions.frown = 0.7;
    expressions.anger = 0.3;
  }

  if (words.some(word => surpriseWords.includes(word))) {
    expressions.surprise = 0.9;
    expressions.blink = 1.0;
  }

  // Random blinking
  if (Math.random() > 0.9) {
    expressions.blink = 1.0;
  }

  // Mouth movement based on text length
  expressions.mouthOpen = Math.min(text.length / 50, 0.8);

  return {
    expressions,
    headMovement: {
      x: Math.sin(Date.now() / 1000) * 0.1,
      y: Math.cos(Date.now() / 1000) * 0.05,
      z: 0
    }
  };
}