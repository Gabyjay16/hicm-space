import { Env } from '../../env';
import { parse, serialize } from 'cookie';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const cookies = parse(cookieHeader);
      const sessionId = cookies.session_id;

      if (sessionId) {
        // Delete session from DB
        await env.DB.prepare('DELETE FROM Sessions WHERE id = ?').bind(sessionId).run();
      }
    }

    const clearCookie = serialize('session_id', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    });

    return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookie
      }
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
