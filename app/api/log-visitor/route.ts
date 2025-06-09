import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/supabase-server';

// A list of common bot user agent substrings
const BOT_UA_PATTERNS = [
  'bot', 'spider', 'crawler', 'monitor', 'curl', 'python-requests', 'ahrefs', 'semrush'
];

export async function POST(request: NextRequest) {
  try {
    const { path, userAgent, ip, userId } = await request.json();

    if (!userAgent || !ip) {
      return NextResponse.json({ error: 'User-Agent and IP are required.' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Heuristic: Check if the user agent contains any known bot patterns
    const isBot = BOT_UA_PATTERNS.some(pattern => userAgent.toLowerCase().includes(pattern));

    const { error } = await supabase.from('visitor_logs').insert({
      path: path,
      user_agent: userAgent,
      ip_address: ip,
      user_id: userId, // Will be null if the user is not logged in
      is_bot_heuristic: isBot,
      method: request.method
    });

    if (error) {
      // Log the error but don't block the user's navigation
      console.error('Error logging visitor:', error.message);
      return NextResponse.json({ error: 'Failed to log visitor data' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 202 });

  } catch (e: any) {
    console.error('Error in /api/log-visitor:', e.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 