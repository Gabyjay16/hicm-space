export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const [matricule, role] = token.split(':');

  if (role !== 'student') {
    return Response.json({ error: 'Only students can vote' }, { status: 403 });
  }

  try {
    const body = await request.json() as { pollId: string, optionId: string };
    
    // Attempt to insert into PollVotes (this will throw if they already voted due to UNIQUE constraint)
    const statements = [
      env.DB.prepare('INSERT INTO PollVotes (poll_id, matricule) VALUES (?, ?)').bind(body.pollId, matricule),
      env.DB.prepare('UPDATE PollOptions SET votes = votes + 1 WHERE id = ?').bind(body.optionId)
    ];

    await env.DB.batch(statements);

    return Response.json({ success: true });
  } catch (e: any) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return Response.json({ error: 'You have already voted in this poll' }, { status: 400 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
};
