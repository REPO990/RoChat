import { Message } from '../types/index';

export const LocalStorageService = {
  saveMessages(roomId: string, messages: Message[]) {
    try {
      const key = `chat_${roomId}`;
      localStorage.setItem(key, JSON.stringify({
        messages,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  },
  
  getMessages(roomId: string): Message[] {
    try {
      const key = `chat_${roomId}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        const parsed = JSON.parse(data);
        // Return only messages from last 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.messages;
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
    
    return [];
  },
  
  clearOldMessages() {
    // Cleanup old messages
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chat_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  }
};