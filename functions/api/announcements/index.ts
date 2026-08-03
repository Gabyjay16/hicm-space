import { Env } from '../../env';
import { parse } from 'cookie';

// GET /api/announcements - fetch all published announcements
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const { results } = await env.DB.prepare(`
      SELECT 
        A.id, 
        A.title, 
        A.content, 
        A.media_url, 
        A.created_at as date,
        U.name as author
      FROM Announcements A
      JOIN Users U ON A.publisher_id = U.id
      WHERE A.published = 1 AND A.archived = 0
      ORDER BY A.created_at DESC
    `).all();

    return Response.json({ success: true, announcements: results });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

// POST /api/announcements - create a new announcement
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const cookies = parse(cookieHeader);
    const sessionId = cookies.session_id;
    if (!sessionId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const session: any = await env.DB.prepare('SELECT user_id, expires_at FROM Sessions WHERE id = ?')
      .bind(sessionId).first();

    if (!session || new Date(session.expires_at) < new Date()) {
      return Response.json({ error: 'Session expired' }, { status: 401 });
    }

    const user: any = await env.DB.prepare('SELECT id, role FROM Users WHERE id = ?')
      .bind(session.user_id).first();

    if (!user) return Response.json({ error: 'User not found' }, { status: 401 });

    // Check permissions (must be admin or staff)
    // Alternatively, check Permissions table for 'publish_announcements'
    let hasPermission = user.role === 'admin' || user.role === 'staff';
    if (!hasPermission) {
      const perm: any = await env.DB.prepare('SELECT 1 FROM Permissions WHERE user_id = ? AND permission = ?')
        .bind(user.id, 'publish_announcements').first();
      if (perm) hasPermission = true;
    }

    if (!hasPermission) {
      return Response.json({ error: 'Forbidden: You do not have permission to publish announcements' }, { status: 403 });
    }

    const body: any = await request.json();
    const { title, content, media_url, published = 1 } = body;

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO Announcements (id, title, content, publisher_id, media_url, published)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, title, content, user.id, media_url || null, published).run();

    return Response.json({ success: true, id });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
