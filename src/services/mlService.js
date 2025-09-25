import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/ml';

const mlService = {
  /**
   * Get health risk assessment from backend ML service
   * @param {Object} healthData - User health data
   * @returns {Promise<Object>} Risk assessment result
   */
  async getHealthRiskAssessment(healthData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/health-risk-assessment`, healthData);
      return response.data;
    } catch (error) {
      console.error('Error fetching health risk assessment:', error);
      throw new Error('Failed to get health risk assessment');
    }
  },

  // Additional ML service methods can be added here
};

export default mlService;
