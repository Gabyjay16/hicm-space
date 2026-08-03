export const onRequestPost: PagesFunction<{ OPENROUTER_API_KEY: string }> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { text: string; numQuestions: number };
    
    if (!body.text) {
      return Response.json({ error: 'Text context is required' }, { status: 400 });
    }

    const numQuestions = body.numQuestions || 5;
    const prompt = `Based on the following text, generate a multiple-choice quiz with ${numQuestions} questions. 
    Format the response strictly as a JSON array of objects. Each object must have the following keys exactly:
    "question" (string), "options" (array of exactly 4 strings), and "answer" (string, must exactly match one of the options).
    
    Text Context:
    ${body.text}
    
    Return ONLY valid JSON.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it:free",
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data: any = await response.json();
    
    if (data.error) {
      return Response.json({ error: data.error.message || 'AI API returned an error' }, { status: 502 });
    }

    if (!response.ok) {
      return Response.json({ error: 'Failed to generate quiz from AI provider' }, { status: 502 });
    }

    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const rawJson = jsonMatch ? jsonMatch[0] : content;
    
    return new Response(rawJson, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
