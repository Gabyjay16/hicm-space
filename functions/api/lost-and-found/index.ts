export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await env.DB.prepare('SELECT * FROM LostAndFound ORDER BY created_at DESC').all();
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
      'INSERT INTO LostAndFound (id, type, item_name, description, contact_info, image_url, reporter_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      body.type,
      body.itemName,
      body.description,
      body.contactInfo,
      body.imageUrl || null,
      matricule
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
  const [matricule, role] = token.split(':');

  try {
    const body = await request.json() as any;
    
    // Determine if the user is authorized to update this item
    // Staff/Admin can update anything. Students can only update their own items.
    let updateQuery;
    let bindArgs;
    if (role === 'staff' || role === 'admin') {
      updateQuery = 'UPDATE LostAndFound SET status = ? WHERE id = ?';
      bindArgs = [body.status, body.id];
    } else {
      updateQuery = 'UPDATE LostAndFound SET status = ? WHERE id = ? AND reporter_id = ?';
      bindArgs = [body.status, body.id, matricule];
    }

    const result = await env.DB.prepare(updateQuery).bind(...bindArgs).run();

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
