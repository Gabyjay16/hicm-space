import { Env } from '../../env';
import { parse, serialize } from 'cookie';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      return Response.json({ error: 'No active session' }, { status: 401 });
    }

    const cookies = parse(cookieHeader);
    const sessionId = cookies.session_id;

    if (!sessionId) {
      return Response.json({ error: 'No session cookie found' }, { status: 401 });
    }

    const session: any = await env.DB.prepare('SELECT user_id, expires_at FROM Sessions WHERE id = ?')
      .bind(sessionId)
      .first();

    if (!session || new Date(session.expires_at) < new Date()) {
      return Response.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const user: any = await env.DB.prepare(
      'SELECT id, name, matricule, role, department FROM Users WHERE id = ?'
    ).bind(session.user_id).first();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    return Response.json({ success: true, user });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
