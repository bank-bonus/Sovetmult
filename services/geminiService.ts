import { QuestionData, CartoonEntry } from "../types";
import { CARTOON_DATABASE } from "../data/cartoons";

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const generateQuizQuestion = async (cartoon: CartoonEntry): Promise<QuestionData> => {
  // Simulate a short delay to feel like "searching/loading"
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get all other titles to serve as wrong answers
  const otherTitles = CARTOON_DATABASE
    .filter(c => c.title !== cartoon.title)
    .map(c => c.title);
    
  // Shuffle and pick 3
  const shuffledWrong = shuffleArray(otherTitles).slice(0, 3);
  
  return {
    correctAnswer: cartoon.title,
    wrongAnswers: shuffledWrong,
    imageUrl: cartoon.imageUrl
  };
};