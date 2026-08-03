export const onRequestGet: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const [matricule] = token.split(':');

  try {
    const pollsResult = await env.DB.prepare('SELECT * FROM Polls ORDER BY created_at DESC').all();
    const optionsResult = await env.DB.prepare('SELECT * FROM PollOptions').all();
    const votesResult = await env.DB.prepare('SELECT poll_id FROM PollVotes WHERE matricule = ?').bind(matricule).all();

    const votedPolls = new Set(votesResult.results.map((v: any) => v.poll_id));

    const polls = pollsResult.results.map((poll: any) => {
      const options = optionsResult.results.filter((opt: any) => opt.poll_id === poll.id);
      return { 
        ...poll, 
        options,
        hasVoted: votedPolls.has(poll.id)
      };
    });

    return Response.json(polls);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
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
    const pollId = crypto.randomUUID();
    
    const statements = [
      env.DB.prepare('INSERT INTO Polls (id, question) VALUES (?, ?)').bind(pollId, body.question)
    ];

    body.options.forEach((opt: string) => {
      statements.push(
        env.DB.prepare('INSERT INTO PollOptions (id, poll_id, option_text, votes) VALUES (?, ?, ?, 0)').bind(crypto.randomUUID(), pollId, opt)
      );
    });

    await env.DB.batch(statements);

    return Response.json({ success: true, pollId });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
