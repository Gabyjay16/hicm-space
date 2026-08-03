import { Env } from '../../env';
import bcrypt from 'bcryptjs';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Check if any admin exists
    const adminCount: any = await env.DB.prepare('SELECT count(*) as count FROM Users WHERE role = \'admin\'').first();
    
    if (adminCount.count > 0) {
      return Response.json({ error: 'Admin already exists. Bootstrap disabled.' }, { status: 403 });
    }

    const data = await request.json() as any;
    const { name, email, password } = data; // use email as matricule for admin

    if (!name || !email || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hash = bcrypt.hashSync(password, 8);
    const userId = crypto.randomUUID();

    await env.DB.prepare(
      'INSERT INTO Users (id, name, matricule, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(userId, name, email.toLowerCase(), hash, 'admin')
    .run();

    return Response.json({ success: true, message: 'Admin account created successfully' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
