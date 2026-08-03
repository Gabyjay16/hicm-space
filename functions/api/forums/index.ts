export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const result = await env.DB.prepare('SELECT * FROM ForumPosts ORDER BY created_at DESC LIMIT 50').all();
    return Response.json(result.results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as any;
    const id = crypto.randomUUID();
    
    await env.DB.prepare(
      'INSERT INTO ForumPosts (id, user_id, author_name, author_role, content) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      id,
      body.userId,
      body.authorName,
      body.authorRole,
      body.content
    ).run();

    return Response.json({ success: true, id });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
