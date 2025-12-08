export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER', // Новое состояние
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

declare global {
  interface Window {
    vkBridge: any;
  }
}
