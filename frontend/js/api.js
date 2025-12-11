/**
 * API Service Module
 * Handles all communication with the Flask backend
 */

const API = {
  baseURL: 'http://localhost:5000',
  
  /**
   * Check API health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        return { online: true, data: await response.json() };
      }
      return { online: false, error: 'Server responded with error' };
    } catch (error) {
      return { online: false, error: error.message };
    }
  },
  
  /**
   * Get model information
   */
  async getModelsInfo() {
    try {
      const response = await fetch(`${this.baseURL}/models/info`);
      if (response.ok) {
        return { success: true, data: await response.json() };
      }
      return { success: false, error: 'Failed to fetch model info' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Predict customer segment
   * @param {number} recency - Days since last purchase
   * @param {number} frequency - Number of purchases
   * @param {number} monetary - Total spending in PHP
   */
  async predictSegment(recency, frequency, monetary) {
    try {
      const response = await fetch(`${this.baseURL}/predict/segment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recency, frequency, monetary })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      return { success: false, error: data.error || 'Prediction failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Generate sales forecast
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {number} periods - Number of days to forecast
   * @param {string} model - Model to use (prophet/xgboost/ensemble)
   */
  async predictForecast(startDate, periods, model = 'ensemble') {
    try {
      const response = await fetch(`${this.baseURL}/predict/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate, periods, model })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      return { success: false, error: data.error || 'Forecast failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
