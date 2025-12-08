import React, { useState, useCallback, useEffect } from 'react';
import { GameState, QuizRound, CartoonEntry } from './types';
import { CARTOON_DATABASE } from './data/cartoons';
import * as QuestionService from './services/geminiService';
import { vkService } from './services/vkService'; // Импортируем наш сервис
import Button from './components/Button';
import RetroTV from './components/RetroTV';

const QUESTIONS_PER_LEVEL = 5;
const MAX_LIVES = 3;

// Shuffles an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentRound, setCurrentRound] = useState<QuizRound | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  // Stats & Lives
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  
  // Level System
  const [level, setLevel] = useState(1);
  const [questionsAnsweredInLevel, setQuestionsAnsweredInLevel] = useState(0);
  
  // UI States
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isChecking, setIsChecking] = useState<string | null>(null);

  // Инициализация VK при старте
  useEffect(() => {
    vkService.init();
  }, []);

  const startNewRound = useCallback(async () => {
    setGameState(GameState.LOADING);
    setErrorMsg("");
    setIsChecking(null);
    
    try {
      const randomCartoon: CartoonEntry = CARTOON_DATABASE[Math.floor(Math.random() * CARTOON_DATABASE.length)];
      const data = await QuestionService.generateQuizQuestion(randomCartoon);
      
      const round: QuizRound = { question: data };
      setCurrentRound(round);

      const allOptions = [data.correctAnswer, ...data.wrongAnswers];
      setShuffledOptions(shuffleArray(allOptions));

      setGameState(GameState.PLAYING);

    } catch (err) {
      console.error(err);
      setErrorMsg("Ошибка программы передач. Попробуйте позже.");
      setGameState(GameState.ERROR);
    }
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setStreak(0);
    setLevel(1);
    setLives(MAX_LIVES);
    setQuestionsAnsweredInLevel(0);
    startNewRound();
  };

  const handleAnswer = (answer: string) => {
    if (!currentRound || isChecking) return;

    setIsChecking(answer);

    setTimeout(() => {
      const isCorrect = answer === currentRound.question.correctAnswer;
      
      setCurrentRound({
        ...currentRound,
        userSelectedAnswer: answer,
        isCorrect
      });

      if (isCorrect) {
        setScore(s => s + 100 + (streak * 10)); 
        setStreak(s => s + 1);
        vkService.taptic('success');
      } else {
        setStreak(0);
        setLives(l => l - 1);
        vkService.taptic('error');
      }

      setQuestionsAnsweredInLevel(prev => prev + 1);
      setIsChecking(null);
      
      // Если жизни кончились - показываем экран Game Over
      if (!isCorrect && lives - 1 <= 0) {
        setGameState(GameState.GAME_OVER);
      } else {
        setGameState(GameState.RESULT);
      }
    }, 1500);
  };

  const handleNextStep = () => {
    if (questionsAnsweredInLevel >= QUESTIONS_PER_LEVEL) {
      setGameState(GameState.LEVEL_COMPLETE);
    } else {
      startNewRound();
    }
  };

  const handleNextLevel = async () => {
    // Показываем рекламу между уровнями
    await vkService.showInterstitial();
    
    setLevel(l => l + 1);
    setQuestionsAnsweredInLevel(0);
    startNewRound();
  };

  const handleRevive = async () => {
    // Реклама за жизнь
    const success = await vkService.showRewarded();
    if (success) {
      setLives(1); // Даем 1 жизнь
      setGameState(GameState.RESULT); // Возвращаем на экран результата (откуда нажмут "Далее")
    }
  };

  const handleShare = () => {
    vkService.shareWall(score);
  };

  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
  };

  // --- Helpers ---
  const renderHearts = () => (
    <div className="flex space-x-1">
      {[...Array(MAX_LIVES)].map((_, i) => (
        <span key={i} className={`text-xl ${i < lives ? 'text-[#cc0000]' : 'text-gray-300'}`}>
          {i < lives ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );

  // --- Render Views ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 animate-fade-in relative overflow-hidden">
      <div className="relative z-10 border-4 border-[#cc0000] p-8 bg-[#f0ead6] shadow-2xl max-w-sm w-full">
        <h1 className="text-5xl font-display text-[#cc0000] uppercase leading-none drop-shadow-sm mb-4">
          СОЮЗ<br/>МУЛЬТ<br/>КВИЗ
        </h1>
        <p className="text-[#1a1a1a] font-bold tracking-widest text-sm uppercase mb-8">
          Викторина СССР
        </p>
        <Button onClick={handleStartGame} variant="primary">НАЧАТЬ ИГРУ</Button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0ead6]">
      <RetroTV loading={true} />
      <p className="mt-4 font-mono text-sm uppercase">Загрузка эфира...</p>
    </div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col min-h-screen bg-[#f0ead6]">
      {/* Header */}
      <div className="bg-[#cc0000] text-[#f0ead6] px-4 py-2 shadow-md flex justify-between items-center z-10 sticky top-0 border-b-4 border-[#a00000]">
        <div className="flex flex-col items-start">
           <span className="text-[10px] uppercase opacity-75">Очки</span>
           <span className="font-bold">{score}</span>
        </div>
        <div className="flex flex-col items-center">
             {renderHearts()}
             <span className="text-[10px] uppercase mt-1">Уровень {level}</span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
        <RetroTV imageSrc={currentRound?.question.imageUrl} />
        
        <div className="space-y-3">
          <div className="bg-[#1a1a1a] text-[#f0ead6] text-center py-2 px-4 uppercase font-bold text-sm -skew-x-6">
             Что это за мультфильм?
          </div>
          <div className="grid grid-cols-1 gap-2">
            {shuffledOptions.map((option, idx) => {
              const isSelected = isChecking === option;
              return (
                <Button 
                  key={idx} 
                  onClick={() => handleAnswer(option)} 
                  variant={isSelected ? 'primary' : 'secondary'}
                  disabled={isChecking !== null}
                  className={`text-left ${isSelected ? 'animate-pulse bg-[#d4af37] text-black' : ''}`}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!currentRound) return null;
    const isWin = currentRound.isCorrect;

    return (
      <div className="flex flex-col min-h-screen bg-[#f0ead6] p-4 items-center justify-center">
        <div className="border-4 border-[#1a1a1a] p-6 w-full max-w-md bg-white text-center shadow-[8px_8px_0_#cc0000]">
          <div className={`text-3xl font-display uppercase mb-4 ${isWin ? 'text-[#4a7c59]' : 'text-[#cc0000]'}`}>
            {isWin ? 'ВЕРНО!' : 'НЕВЕРНО!'}
          </div>
          
          <p className="text-xs uppercase text-gray-500 mb-1">Правильный ответ:</p>
          <p className="text-xl font-bold mb-6">{currentRound.question.correctAnswer}</p>
          
          <div className="w-32 mx-auto mb-6">
             <img src={currentRound.question.imageUrl} className="rounded border-2 border-black" alt="" />
          </div>

          <Button onClick={handleNextStep} variant="primary">
            {questionsAnsweredInLevel >= QUESTIONS_PER_LEVEL ? 'К ИТОГАМ' : 'ДАЛЕЕ'}
          </Button>
        </div>
      </div>
    );
  };

  const renderGameOver = () => (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] p-6 items-center justify-center text-[#f0ead6]">
      <div className="text-6xl mb-4">📺</div>
      <h2 className="text-4xl font-display uppercase text-[#cc0000] mb-2">КОНЕЦ ЭФИРА</h2>
      <p className="uppercase tracking-widest text-sm mb-8">Ваш счет: <span className="text-white font-bold">{score}</span></p>
      
      <div className="space-y-4 w-full max-w-sm">
        <Button onClick={handleRevive} variant="success" className="animate-pulse">
          📺 ВОСКРЕСНУТЬ (РЕКЛАМА)
        </Button>
        <Button onClick={handleShare} variant="secondary">
          📢 ПОХВАСТАТЬСЯ
        </Button>
        <Button onClick={handleBackToMenu} variant="danger">
          В МЕНЮ
        </Button>
      </div>
    </div>
  );

  const renderLevelComplete = () => (
    <div className="flex flex-col min-h-screen bg-[#f0ead6] items-center justify-center p-6">
       <div className="bg-white border-4 border-[#d4af37] p-8 w-full max-w-sm text-center shadow-xl">
         <h2 className="text-2xl font-bold uppercase mb-4">Уровень {level} пройден!</h2>
         <div className="text-4xl text-[#d4af37] mb-6">★★★</div>
         <Button onClick={handleNextLevel} variant="primary">СЛЕДУЮЩИЙ УРОВЕНЬ</Button>
       </div>
    </div>
  );

  return (
    <>
      {gameState === GameState.MENU && renderMenu()}
      {gameState === GameState.LOADING && renderLoading()}
      {gameState === GameState.PLAYING && renderPlaying()}
      {gameState === GameState.RESULT && renderResult()}
      {gameState === GameState.LEVEL_COMPLETE && renderLevelComplete()}
      {gameState === GameState.GAME_OVER && renderGameOver()}
      {gameState === GameState.ERROR && (
         <div className="p-10 text-center">
            <p className="text-red-600 font-bold">{errorMsg}</p>
            <Button onClick={handleStartGame} variant="primary" className="mt-4">Перезагрузить</Button>
         </div>
      )}
    </>
  );
};

export default App;
