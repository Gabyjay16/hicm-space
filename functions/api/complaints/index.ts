export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const token = authHeader.replace('Bearer ', '');
  const [matricule, role] = token.split(':');
  
  try {
    let result;
    if (role === 'staff' || role === 'admin') {
      result = await env.DB.prepare('SELECT * FROM Complaints ORDER BY created_at DESC').all();
    } else {
      result = await env.DB.prepare('SELECT * FROM Complaints WHERE matricule = ? ORDER BY created_at DESC').bind(matricule).all();
    }
    return Response.json(result.results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const [matricule] = token.split(':');

  try {
    const body = await request.json() as any;
    const id = crypto.randomUUID();
    
    await env.DB.prepare(
      'INSERT INTO Complaints (id, matricule, category, description, proof_url) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      id,
      matricule,
      body.category,
      body.description,
      body.proofUrl || null
    ).run();

    return Response.json({ success: true, id });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPatch: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const [, role] = token.split(':');

  if (role !== 'staff' && role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json() as any;
    await env.DB.prepare(
      'UPDATE Complaints SET status = ? WHERE id = ?'
    ).bind(body.status, body.id).run();

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
