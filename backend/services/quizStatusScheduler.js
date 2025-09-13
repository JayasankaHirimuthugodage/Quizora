// backend/services/quizStatusScheduler.js

import Quiz from '../models/Quiz.js';

class QuizStatusScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  start(intervalMinutes = 1) {
    if (this.isRunning) {
      console.log('Quiz status scheduler is already running');
      return;
    }

    console.log(`Starting quiz status scheduler with ${intervalMinutes} minute interval`);
    
    // Run immediately
    this.updateQuizStatuses();
    
    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.updateQuizStatuses();
    }, intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('Quiz status scheduler stopped');
    }
  }

  async updateQuizStatuses() {
    try {
      const results = await Quiz.updateAllStatuses();
      
      if (results.activated > 0 || results.completed > 0) {
        console.log('Quiz status update results:', results);
      }
    } catch (error) {
      console.error('Error in scheduled quiz status update:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId
    };
  }
}

// Export singleton instance
export default new QuizStatusScheduler();