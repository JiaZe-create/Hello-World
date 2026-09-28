import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Profile performs a fresh user check and prompts for missing names.
      return new NextResponse(null, { status: 303, headers: { Location: '/profile', 'Cache-Control': 'private, no-store' } });
    }
  }
  return new NextResponse(null, { status: 303, headers: { Location: '/login?error=callback', 'Cache-Control': 'private, no-store' } });
}
