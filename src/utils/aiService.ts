// These functions now call our backend Cloudflare Pages Functions to protect API keys

export const generateQuiz = async (contextText: string, numQuestions: number = 5) => {
  try {
    const response = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: contextText,
        numQuestions: numQuestions
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate quiz');
    }

    return data;
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const analyzeThesis = async (thesisText: string) => {
  try {
    const response = await fetch('/api/ai/thesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: thesisText
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze thesis');
    }

    return data;
  } catch (error: any) {
    console.error("Error analyzing thesis:", error);
    throw error;
  }
};
