import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function authenticate(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { user: session.user, session };
}