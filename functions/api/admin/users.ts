import { Env } from '../../env';
import { parse } from 'cookie';

// Auth middleware helper
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
  const admin = await checkAdmin(request, env);
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { results } = await env.DB.prepare('SELECT id, name, matricule, role, department, phone, created_at FROM Users').all();
    return Response.json({ success: true, users: results });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
