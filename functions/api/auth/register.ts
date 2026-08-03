import { Env } from '../../env';
import bcrypt from 'bcryptjs';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data = await request.json() as any;
    const { name, matricule, department, phone, password, confirmPassword, staffCode } = data;

    if (!name || !matricule || !password || !confirmPassword) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if matricule exists
    const existingUser = await env.DB.prepare('SELECT id FROM Users WHERE lower(matricule) = lower(?)')
      .bind(matricule)
      .first();

    if (existingUser) {
      return Response.json({ error: 'User with this matricule already exists' }, { status: 400 });
    }

    let role = 'student';
    if (staffCode) {
      // Verify staff code
      const validCode = await env.DB.prepare('SELECT code FROM StaffCodes WHERE code = ? AND used = 0')
        .bind(staffCode)
        .first();
        
      if (!validCode) {
        return Response.json({ error: 'Invalid or already used staff code' }, { status: 400 });
      }
      
      role = 'staff';
      // Mark as used
      await env.DB.prepare('UPDATE StaffCodes SET used = 1 WHERE code = ?').bind(staffCode).run();
    }

    // Use a small salt round for Workers to avoid CPU limit timeouts
    const hash = bcrypt.hashSync(password, 8);
    const userId = crypto.randomUUID();

    await env.DB.prepare(
      'INSERT INTO Users (id, name, matricule, password_hash, role, department, phone) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(userId, name, matricule.toUpperCase(), hash, role, department || null, phone || null)
    .run();

    return Response.json({ success: true, message: 'Registration successful' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
