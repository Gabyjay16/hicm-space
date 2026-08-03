import { Env } from '../../env';
import { parse } from 'cookie';

const checkAdmin = async (request: Request, env: Env) => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  if (!cookies.session_id) return null;
  const session: any = await env.DB.prepare('SELECT user_id, expires_at FROM Sessions WHERE id = ?').bind(cookies.session_id).first();
  if (!session || new Date(session.expires_at) < new Date()) return null;
  const user: any = await env.DB.prepare('SELECT id, role FROM Users WHERE id = ?').bind(session.user_id).first();
  if (!user || user.role !== 'admin') return null;
  return user;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!(await checkAdmin(request, env))) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { results } = await env.DB.prepare('SELECT code, used, created_at FROM StaffCodes ORDER BY created_at DESC').all();
    return Response.json({ success: true, codes: results });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const admin = await checkAdmin(request, env);
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const newCode = `SC-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    await env.DB.prepare('INSERT INTO StaffCodes (code) VALUES (?)').bind(newCode).run();
    
    // Log audit
    await env.DB.prepare('INSERT INTO AuditLogs (id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .bind(crypto.randomUUID(), admin.id, 'CREATE_STAFF_CODE', `Generated code ${newCode}`).run();

    return Response.json({ success: true, code: newCode });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
