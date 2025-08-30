import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for demo purposes (use Redis in production)
const sessions = new Map();

export async function POST(req: NextRequest) {
  try {
    const { type, sessionId, data } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    if (type === 'offer' || type === 'answer' || type === 'candidate') {
      // Store signaling data for the session
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
      }
      
      sessions.get(sessionId).push({ type, data });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid signal type' }, { status: 400 });
  } catch (error) {
    console.error('WebRTC signaling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    
    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ signals: [] });
    }

    const signals = sessions.get(sessionId);
    return NextResponse.json({ signals });
  } catch (error) {
    console.error('WebRTC signaling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}