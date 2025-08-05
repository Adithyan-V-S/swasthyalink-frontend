import { v4 as uuidv4 } from 'uuid';

class DialogflowService {
  constructor() {
    this.apiUrl = 'http://localhost:3001/api/chatbot'; // Backend API endpoint
  }

  async detectIntent(message, sessionId = null) {
    if (!sessionId) {
      sessionId = uuidv4();
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('DialogflowService detectIntent error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get response from Dialogflow'
      };
    }
  }
}

export default new DialogflowService();
