import React, { useState } from "react";

function SnakeGame() {
  const gridSize = 10;
  const initialSnake = [
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ];
  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 7, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  React.useEffect(() => {
    if (gameOver) return;
    const handle = setInterval(() => {
      setSnake((prev) => {
        const newHead = {
          x: prev[0].x + direction.x,
          y: prev[0].y + direction.y,
        };
        if (
          newHead.x < 0 ||
          newHead.x >= gridSize ||
          newHead.y < 0 ||
          newHead.y >= gridSize ||
          prev.some((s) => s.x === newHead.x && s.y === newHead.y)
        ) {
          setGameOver(true);
          return prev;
        }
        let newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          let newFood;
          do {
            newFood = {
              x: Math.floor(Math.random() * gridSize),
              y: Math.floor(Math.random() * gridSize),
            };
          } while (newSnake.some((s) => s.x === newFood.x && s.y === newFood.y));
          setFood(newFood);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 180);
    return () => clearInterval(handle);
  }, [direction, food, gameOver, gameKey]);

  React.useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowUp" && direction.y !== 1) setDirection({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && direction.y !== -1) setDirection({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && direction.x !== 1) setDirection({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && direction.x !== -1) setDirection({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction, gameOver]);

  const handleRestart = () => {
    setSnake(initialSnake);
    setDirection({ x: 1, y: 0 });
    setFood({ x: 7, y: 5 });
    setScore(0);
    setGameOver(false);
    setGameKey((k) => k + 1);
  };

  return (
    <div className="relative w-64 h-64 bg-white/80 rounded-xl shadow-lg mb-6 flex flex-col items-center justify-center overflow-hidden border-2 border-green-200">
      <div className="absolute top-2 left-2 text-xs text-green-600 font-semibold">Snake Game</div>
      <div className="absolute top-2 right-2 text-xs text-gray-400">Score: {score}</div>
      <div className="grid grid-cols-10 grid-rows-10 gap-0.5 mt-6">
        {[...Array(gridSize * gridSize)].map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={`w-5 h-5 rounded ${
                isHead
                  ? "bg-green-600"
                  : isSnake
                  ? "bg-green-300"
                  : isFood
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-white/0"
              }`}
            />
          );
        })}
      </div>
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
          <div className="text-lg font-bold text-green-700 mb-2">Game Over!</div>
          <button
            onClick={handleRestart}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default SnakeGame; 