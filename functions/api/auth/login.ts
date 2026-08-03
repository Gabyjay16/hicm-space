import { Env } from '../../env';
import { serialize } from 'cookie';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data = await request.json() as any;
    const { matricule, password, rememberMe } = data;

    if (!matricule || !password) {
      return Response.json({ error: 'Missing matricule or password' }, { status: 400 });
    }

    const user: any = await env.DB.prepare(
      'SELECT id, name, matricule, role, password_hash, department FROM Users WHERE lower(matricule) = lower(?)'
    ).bind(matricule).first();

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const inputHash = await hashPassword(password);
    const isValid = (inputHash === user.password_hash);
    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionId = crypto.randomUUID();
    const expiresInDays = rememberMe ? 30 : 1;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await env.DB.prepare('INSERT INTO Sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(sessionId, user.id, expiresAt.toISOString())
      .run();

    const setCookie = serialize('session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: expiresAt
    });

    // Don't send password hash back
    const { password_hash, ...safeUser } = user;

    return new Response(JSON.stringify({ success: true, user: safeUser }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setCookie
      }
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
