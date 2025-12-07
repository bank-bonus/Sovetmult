import React, { useState, useCallback, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge'; // Импортируем официальный мост
import { GameState, QuizRound, CartoonEntry } from './types';
import { CARTOON_DATABASE } from './data/cartoons';
import * as QuestionService from './services/geminiService';
import Button from './components/Button';
import RetroTV from './components/RetroTV';

const QUESTIONS_PER_LEVEL = 5;

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
  
  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Level System
  const [level, setLevel] = useState(1);
  const [questionsAnsweredInLevel, setQuestionsAnsweredInLevel] = useState(0);
  
  // UI States
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isChecking, setIsChecking] = useState<string | null>(null);

  // Initialize VK Bridge when App mounts
  useEffect(() => {
    async function init() {
      try {
        // Отправляем событие инициализации через библиотеку
        await bridge.send('VKWebAppInit');
        console.log('VK Bridge Initialized successfully');
      } catch (error) {
        console.error('VK Bridge Init Failed', error);
        // Даже если ошибка (например, запуск не в ВК, а локально), 
        // не блокируем игру, чтобы можно было тестить
      }
    }
    init();
  }, []);

  const startNewRound = useCallback(async () => {
    setGameState(GameState.LOADING);
    setErrorMsg("");
    setIsChecking(null);
    
    try {
      // Проверка на пустую базу данных
      if (!CARTOON_DATABASE || CARTOON_DATABASE.length === 0) {
        throw new Error("База данных мультфильмов пуста");
      }

      const randomCartoon: CartoonEntry = CARTOON_DATABASE[Math.floor(Math.random() * CARTOON_DATABASE.length)];
      
      // Генерация вопроса
      const data = await QuestionService.generateQuizQuestion(randomCartoon);
      
      if (!data || !data.correctAnswer) {
        throw new Error("Некорректный ответ от генератора вопросов");
      }

      const round: QuizRound = {
        question: data,
      };
      
      setCurrentRound(round);

      const allOptions = [data.correctAnswer, ...data.wrongAnswers];
      setShuffledOptions(shuffleArray(allOptions));

      setGameState(GameState.PLAYING);

    } catch (err: any) {
      console.error("Ошибка в startNewRound:", err);
      setErrorMsg(err.message || "Ошибка программы передач. Попробуйте позже.");
      setGameState(GameState.ERROR);
    }
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setStreak(0);
    setLevel(1);
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
      } else {
        setStreak(0);
      }

      setQuestionsAnsweredInLevel(prev => prev + 1);
      setIsChecking(null);
      setGameState(GameState.RESULT);
    }, 1500);
  };

  const handleNextStep = () => {
    if (questionsAnsweredInLevel >= QUESTIONS_PER_LEVEL) {
      setGameState(GameState.LEVEL_COMPLETE);
    } else {
      startNewRound();
    }
  };

  const handleNextLevel = () => {
    setLevel(l => l + 1);
    setQuestionsAnsweredInLevel(0);
    startNewRound();
  };

  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
  };

  // --- Render Views ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 relative overflow-hidden bg-[#f0ead6]">
      <div className="absolute top-0 left-0 w-full h-8 bg-[#cc0000] z-0"></div>
      <div className="absolute bottom-0 left-0 w-full h-8 bg-[#cc0000] z-0"></div>
      
      <div className="relative z-10 border-4 border-[#cc0000] p-8 bg-[#f0ead6] shadow-2xl max-w-sm w-full">
        <div className="space-y-4 mb-8">
          <h1 className="text-5xl font-display text-[#cc0000] uppercase leading-none drop-shadow-sm">
            СОЮЗ<br/>МУЛЬТ<br/>КВИЗ
          </h1>
          <div className="h-1 w-24 bg-[#1a1a1a] mx-auto"></div>
          <p className="text-[#1a1a1a] font-bold tracking-widest text-sm uppercase">Проверь свои знания</p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleStartGame} variant="primary">
            НАЧАТЬ СЕАНС
          </Button>
          <div className="text-[12px] text-[#555] font-mono pt-4 leading-tight italic">
            "Это было давно, вспомним все мультфильмы"
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8 bg-[#f0ead6]">
      <RetroTV loading={true} />
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display text-[#cc0000] uppercase">ВНИМАНИЕ</h2>
        <p className="text-[#1a1a1a] font-bold uppercase tracking-widest text-sm border-t-2 border-[#1a1a1a] pt-2 inline-block">
          Подготовка программы передач...
        </p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6 bg-[#f0ead6]">
      <div className="text-6xl text-[#cc0000]">☭</div>
      <h2 className="text-2xl font-bold text-[#1a1a1a] uppercase border-b-4 border-[#cc0000] pb-2">Сбой Вещания</h2>
      <p className="text-[#555] max-w-xs font-mono text-sm break-words">{errorMsg}</p>
      <Button onClick={handleStartGame} variant="secondary">Повторить попытку</Button>
    </div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col min-h-screen bg-[#f0ead6]">
      {/* Soviet Header */}
      <div className="bg-[#cc0000] text-[#f0ead6] px-4 py-3 shadow-md flex justify-between items-center z-10 sticky top-0 border-b-4 border-[#a00000]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase opacity-75 tracking-wider">Счет</span>
          <div className="text-2xl font-display leading-none">{score}</div>
        </div>
        <div className="text-center flex flex-col items-center">
             <span className="text-xs uppercase tracking-widest text-[#f0ead6] opacity-80">Уровень {level}</span>
             <div className="flex space-x-1 mt-1">
                {[...Array(QUESTIONS_PER_LEVEL)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < questionsAnsweredInLevel ? 'bg-white' : 'bg-[#a00000]'}`}></div>
                ))}
             </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase opacity-75 tracking-wider">Серия</span>
          <div className="text-2xl font-display leading-none">x{streak}</div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
        <RetroTV imageSrc={currentRound?.question.imageUrl} />
        
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] text-[#f0ead6] text-center py-2 px-4 uppercase font-bold text-sm tracking-widest shadow-lg -skew-x-6 transform">
             Как называется этот мультфильм?
          </div>
          <div className="grid grid-cols-1 gap-3 pt-2">
            {shuffledOptions.map((option, idx) => {
              const isSelected = isChecking === option;
              
              return (
                <Button 
                  key={idx} 
                  onClick={() => handleAnswer(option)} 
                  variant={isSelected ? 'primary' : 'secondary'}
                  disabled={isChecking !== null}
                  className={`text-left transition-all duration-200 ${isSelected ? 'animate-pulse bg-[#d4af37] border-[#cc0000] text-black' : ''}`}
                >
                  {option} {isSelected && '...'}
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
      <div className="flex flex-col min-h-screen bg-[#f0ead6] p-4">
        <div className="flex-1 border-4 border-[#1a1a1a] p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-6 text-center bg-white shadow-[10px_10px_0px_0px_#cc0000]">
          
          <div className={`w-full py-4 uppercase font-display text-3xl text-white ${isWin ? 'bg-[#4a7c59]' : 'bg-[#cc0000]'}`}>
            {isWin ? 'ПРАВИЛЬНО!' : 'ОШИБКА!'}
          </div>

          <div className="space-y-2">
            <p className="text-[#555] text-xs uppercase tracking-widest">Правильный ответ:</p>
            <p className="text-2xl font-bold text-[#1a1a1a] border-b-2 border-[#cc0000] pb-2 inline-block">
              {currentRound.question.correctAnswer}
            </p>
          </div>

          <div className="w-48 mx-auto grayscale hover:grayscale-0 transition-all duration-500">
             {/* Проверка на наличие картинки, чтобы не упало */}
             {currentRound.question.imageUrl && (
                 <img src={currentRound.question.imageUrl} className="rounded border-4 border-[#1a1a1a]" alt="result" />
             )}
          </div>

          <div className="w-full space-y-4 pt-4">
            <Button onClick={handleNextStep} variant="primary">
              {questionsAnsweredInLevel >= QUESTIONS_PER_LEVEL ? 'ИТОГИ УРОВНЯ' : 'ДАЛЕЕ'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderLevelComplete = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 bg-[#f0ead6]">
      <div className="relative z-10 border-4 border-[#d4af37] p-8 bg-white shadow-2xl max-w-sm w-full">
        <div className="space-y-4 mb-6">
          <div className="text-4xl text-[#d4af37]">★ ★ ★</div>
          <h2 className="text-3xl font-display text-[#1a1a1a] uppercase leading-none">
            УРОВЕНЬ {level}<br/>ПРОЙДЕН
          </h2>
          <div className="h-1 w-full bg-[#1a1a1a] mx-auto my-4"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="flex flex-col border-r-2 border-[#eee]">
             <span className="text-xs uppercase text-[#555]">Счет</span>
             <span className="text-2xl font-bold text-[#cc0000]">{score}</span>
           </div>
           <div className="flex flex-col">
             <span className="text-xs uppercase text-[#555]">Серия</span>
             <span className="text-2xl font-bold text-[#1a1a1a]">{streak}</span>
           </div>
        </div>

        <div className="space-y-4">
          <Button onClick={handleNextLevel} variant="primary">
            СЛЕДУЮЩИЙ УРОВЕНЬ
          </Button>
          <Button onClick={handleBackToMenu} variant="secondary">
            В МЕНЮ
          </Button>
        </div>
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
      {gameState === GameState.ERROR && renderError()}
    </>
  );
};

export default App;
