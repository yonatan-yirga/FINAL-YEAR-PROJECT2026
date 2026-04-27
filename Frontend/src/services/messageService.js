/**
 * Message Service
 * API calls for student-advisor messaging.
 */
import apiService from './api';

const messageService = {
  /**
   * Get all conversations for the current user.
   */
  getConversations: async () => {
    try {
      const response = await apiService.get('/messages/conversations/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load conversations.',
      };
    }
  },

  /**
   * Get messages for a specific advisor assignment.
   * Also marks unread messages as read.
   */
  getMessages: async (assignmentId) => {
    try {
      const response = await apiService.get(`/messages/${assignmentId}/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load messages.',
      };
    }
  },

  /**
   * Send a message.
   */
  sendMessage: async (assignmentId, content) => {
    try {
      const response = await apiService.post('/messages/send/', {
        assignment_id: assignmentId,
        content,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send message.',
      };
    }
  },
};

export default messageService;
