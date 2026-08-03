// This uses the OpenRouter API key provided by the user.
// WARNING: In a production app, never expose API keys in frontend code.
// Consider using a backend proxy (e.g. Cloudflare Worker) to hide the key.
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateQuiz = async (contextText: string, numQuestions: number = 5) => {
  try {
    const prompt = `Based on the following text, generate a multiple-choice quiz with ${numQuestions} questions. 
    Format the response strictly as a JSON array of objects. Each object must have the following keys exactly:
    "question" (string), "options" (array of exactly 4 strings), and "answer" (string, must exactly match one of the options).
    
    Text Context:
    ${contextText}
    
    Return ONLY valid JSON.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin, // Optional, for OpenRouter rankings
        'X-Title': 'HICM SPACE', // Optional, for OpenRouter rankings
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free", // Use a free model since the provided key might not have credits
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }
    
    if (!response.ok) {
      throw new Error('Failed to generate quiz');
    }

    const content = data.choices[0].message.content;
    
    // Attempt to extract JSON if it was wrapped in markdown
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const rawJson = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(rawJson);
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    throw error; // Re-throw to handle in the component
  }
};

export const analyzeThesis = async (thesisText: string) => {
  try {
    const prompt = `Analyze the following abstract of a student thesis for plagiarism and AI-generated content.
    Return a strictly formatted JSON object with the following structure:
    {
      "plagiarismScore": (number between 0 and 100),
      "aiScore": (number between 0 and 100),
      "highlights": [(array of 2 or 3 short string excerpts from the text that seem suspicious or poorly cited)]
    }
    
    Thesis text:
    ${thesisText}
    
    Return ONLY valid JSON.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'HICM SPACE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }

    if (!response.ok) {
      throw new Error('Failed to analyze thesis');
    }

    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const rawJson = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(rawJson);
  } catch (error: any) {
    console.error("Error analyzing thesis:", error);
    throw error; // Re-throw to handle in the component
  }
};
