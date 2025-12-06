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