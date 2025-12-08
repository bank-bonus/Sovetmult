export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  ERROR = 'ERROR'
}

export interface CartoonEntry {
  title: string;
  imageUrl: string;
}

export interface QuestionData {
  correctAnswer: string;
  wrongAnswers: string[];
  imageUrl: string;
}

export interface QuizRound {
  question: QuestionData;
  userSelectedAnswer?: string;
  isCorrect?: boolean;
}

// Global declaration for VK Bridge
declare global {
  interface Window {
    vkBridge: {
      send: (method: string, params?: any) => Promise<any>;
      subscribe: (callback: (event: any) => void) => void;
    };
  }
}