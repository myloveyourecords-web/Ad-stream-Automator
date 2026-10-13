import { SurveyResponse } from '../types';

const STORAGE_KEY_SURVEYS = 'adstream_survey_responses_v1';

/**
 * Survey Storage Service
 * Persists survey submissions to localStorage with an asynchronous API abstraction,
 * making it effortless to swap with an HTTP/REST backend endpoint in the future.
 */
export const surveyService = {
  /**
   * Save a single completed survey response
   */
  async saveSurveyResponse(response: SurveyResponse): Promise<void> {
    try {
      const existing = await this.getSurveyResponses();
      const updated = [response, ...existing];
      localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(updated));
      
      // Dispatch a storage event or custom event for reactive dashboard updates
      window.dispatchEvent(new CustomEvent('adstream:survey-saved', { detail: response }));
    } catch (err) {
      console.error('Failed to save survey response to localStorage:', err);
      throw err;
    }
  },

  /**
   * Retrieve all saved survey responses
   */
  async getSurveyResponses(): Promise<SurveyResponse[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SURVEYS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Failed to parse survey responses from localStorage:', err);
      return [];
    }
  },

  /**
   * Retrieve total number of saved responses
   */
  async getCount(): Promise<number> {
    const all = await this.getSurveyResponses();
    return all.length;
  },

  /**
   * Clear survey response history
   */
  async clearResponses(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_SURVEYS);
    window.dispatchEvent(new CustomEvent('adstream:survey-saved'));
  },

  /**
   * Export survey responses as a JSON string for download/backup
   */
  async exportJSON(): Promise<string> {
    const all = await this.getSurveyResponses();
    return JSON.stringify(all, null, 2);
  }
};
