import React, { useState, useEffect, useRef } from 'react';
import './SnakeGame.css';

const SnakeGame: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(
    parseInt(window.localStorage.getItem('maxScore') || '0')
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const domScoreRef = useRef<HTMLSpanElement>(null);

  const [snake, setSnake] = useState({
    pos: { x: 0, y: 0 },
    dir: { x: 0, y: 0 },
    type: 'player',
    index: 0,
    delay: 5,
    size: 0,
    color: 'white',
    history: [] as any[],
    total: 1,
  });

  const [food, setFood] = useState({
    pos: { x: 0, y: 0 },
    color: '',
    size: 0,
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  const W = 400;
  const H = 400;
  const cells = 20;
  const cellSize = W / cells;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      initialize(ctx);
    }
  }, []);

  const initialize = (ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    cellsCount = cells * cells;
    setSnake((prevSnake) => ({
      ...prevSnake,
      size: W / cells,
    }));
    setFood((prevFood) => ({
      ...prevFood,
      size: cellSize,
    }));
    document.addEventListener('keydown', handleKeyDown);
    loop(ctx);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle key events
  };

  const loop = (ctx: CanvasRenderingContext2D) => {
    clear(ctx);
    if (!isGameOver) {
      requestAnimationFrame(() => loop(ctx));
      drawGrid(ctx);
      updateSnake(ctx);
      drawFood(ctx);
      particles.forEach((p) => p.update(ctx));
      garbageCollector();
    } else {
      clear(ctx);
      gameOver(ctx);
    }
  };

  const clear = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, W, H);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    // Draw grid lines
  };

  const updateSnake = (ctx: CanvasRenderingContext2D) => {
    // Update snake position and logic
  };

  const drawFood = (ctx: CanvasRenderingContext2D) => {
    // Draw food on canvas
  };

  const gameOver = (ctx: CanvasRenderingContext2D) => {
    // Display game over screen
  };

  const resetGame = () => {
    // Reset game state
  };

  return (
    <div className="container noselect">
      <div className="wrapper">
        <button id="replay" onClick={resetGame}>
          <i className="fas fa-play"></i>
          RESTART
        </button>
        <div id="canvas">
          <canvas ref={canvasRef} width={W} height={H}></canvas>
        </div>
        <div id="ui">
          <h2>SCORE</h2>
          <span ref={domScoreRef} id="score">{score.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <div id="author">
        <h1>SNAKE</h1> <span>by Fariat</span>
      </div>
    </div>
  );
};

export default SnakeGame;
