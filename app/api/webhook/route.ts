import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook pour recevoir les événements de Farcaster
 * @see https://docs.farcaster.xyz/developers/frames/webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('Farcaster webhook received:', body);
    
    // Ici tu peux traiter les événements Farcaster
    // Par exemple: nouveaux followers, mentions, etc.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
