class GeminiService {
  constructor() {
  }

  async sendMessage(message, conversationId = null) {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    // Extract the generated text from the response
    const generatedText = data.response || 'Sorry, I could not generate a response.';
    return generatedText;
  }
}

export default new GeminiService();
