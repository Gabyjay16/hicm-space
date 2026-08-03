import { Env } from '../../env';
import { parse } from 'cookie';

// GET /api/storage - List all notes
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. Auth check
  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionId = cookies.session_id;
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const sessionCheck = await env.DB.prepare(
      'SELECT user_id FROM Sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP'
    ).bind(sessionId).first();

    if (!sessionCheck) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Fetch notes
    const { results } = await env.DB.prepare(`
      SELECT n.id, n.title, n.description, n.file_key, n.created_at, u.name as uploader_name
      FROM Notes n
      JOIN Users u ON n.uploader_id = u.id
      ORDER BY n.created_at DESC
    `).all();

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// POST /api/storage - Upload a note (Staff/Admin only)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. Auth check
  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionId = cookies.session_id;
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const session = await env.DB.prepare(`
      SELECT s.user_id, u.role 
      FROM Sessions s 
      JOIN Users u ON s.user_id = u.id 
      WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first<{user_id: string, role: string}>();

    if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;

    if (!title || !file) {
      return new Response(JSON.stringify({ error: 'Title and file are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const fileId = crypto.randomUUID();
    const extension = file.name.split('.').pop();
    const fileKey = `notes/${fileId}.${extension}`;

    // 3. Upload to R2
    await env.STORAGE.put(fileKey, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
      }
    });

    // 4. Save metadata to D1
    const noteId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO Notes (id, title, description, file_key, uploader_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(noteId, title, description, fileKey, session.user_id).run();

    return new Response(JSON.stringify({ success: true, noteId, fileKey }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
