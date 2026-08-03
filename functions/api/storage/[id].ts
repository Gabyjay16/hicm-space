import { Env } from '../../env';
import { parse } from 'cookie';

// GET /api/storage/[id] - Download a note
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const noteId = params.id as string;

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

    // 2. Lookup file_key in D1
    const note = await env.DB.prepare('SELECT file_key, title FROM Notes WHERE id = ?').bind(noteId).first<{file_key: string, title: string}>();
    if (!note) {
      return new Response(JSON.stringify({ error: 'Note not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Fetch from R2
    const object = await env.STORAGE.get(note.file_key);
    if (!object) {
      return new Response(JSON.stringify({ error: 'File not found in storage' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // 4. Return as downloadable response
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    // We can extract extension from file_key to give it a proper filename
    const extension = note.file_key.split('.').pop();
    // Use title for the downloaded filename, sanitizing it to prevent header issues
    const safeTitle = note.title.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    headers.set('Content-Disposition', `attachment; filename="${safeTitle}.${extension}"`);

    return new Response(object.body, {
      headers,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// DELETE /api/storage/[id] - Delete a note (Staff/Admin only)
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const noteId = params.id as string;

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

    // 2. Fetch the file key
    const note = await env.DB.prepare('SELECT file_key FROM Notes WHERE id = ?').bind(noteId).first<{file_key: string}>();
    if (!note) {
      return new Response(JSON.stringify({ error: 'Note not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Delete from R2
    await env.STORAGE.delete(note.file_key);

    // 4. Delete from D1
    await env.DB.prepare('DELETE FROM Notes WHERE id = ?').bind(noteId).run();

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
