// List of inappropriate words (simplified version)
const BAD_WORDS = [
  'badword1',
  'badword2',
  // Add more as needed
];

export const ModerationService = {
  async checkMessage(message: string): Promise<{
    isSafe: boolean;
    flaggedWords?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
  }> {
    const lowerMessage = message.toLowerCase();
    const foundWords = BAD_WORDS.filter(word => 
      lowerMessage.includes(word.toLowerCase())
    );
    
    if (foundWords.length > 0) {
      return {
        isSafe: false,
        flaggedWords: foundWords,
        riskLevel: foundWords.length > 2 ? 'high' : 'medium'
      };
    }
    
    // Check message length
    if (message.length > 500) {
      return {
        isSafe: false,
        riskLevel: 'medium'
      };
    }
    
    return { isSafe: true, riskLevel: 'low' };
  },
  
  async checkUserBehavior(userId: number): Promise<{
    isRestricted: boolean;
    reason?: string;
    expiresAt?: Date;
  }> {
    // Simple check - you can expand this later
    return { isRestricted: false };
  }
};