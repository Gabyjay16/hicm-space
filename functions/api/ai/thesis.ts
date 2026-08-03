export const onRequestPost: PagesFunction<{ OPENROUTER_API_KEY: string }> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { text: string };
    
    if (!body.text) {
      return Response.json({ error: 'Thesis text is required' }, { status: 400 });
    }

    const prompt = `Analyze the following abstract or excerpt of a student thesis for plagiarism and AI-generated content.
    Return a strictly formatted JSON object with the following structure:
    {
      "plagiarismScore": (number between 0 and 100 representing plagiarism percentage),
      "aiScore": (number between 0 and 100 representing AI probability),
      "highlights": [(array of 2 or 3 short string excerpts from the text that seem suspicious, AI-generated, or poorly cited)]
    }
    
    Thesis text:
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
      return Response.json({ error: data.error.message || 'API returned an error' }, { status: 502 });
    }

    if (!response.ok) {
      return Response.json({ error: 'Failed to analyze thesis' }, { status: 502 });
    }

    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return Response.json({ error: 'AI failed to return valid JSON format', rawOutput: content }, { status: 502 });
    }

    const rawJson = jsonMatch[0];
    
    return new Response(rawJson, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
