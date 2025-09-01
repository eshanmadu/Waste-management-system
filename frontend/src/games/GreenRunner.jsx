import React, { useEffect, useState, useRef } from "react";
import { FaLeaf, FaRecycle, FaTrophy, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

export default function GreenRunner() {
  const [jumping, setJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [obstacleLeft, setObstacleLeft] = useState(100);
  const [obstacleType, setObstacleType] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(30);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [powerUpType, setPowerUpType] = useState(null);
  const [powerUpLeft, setPowerUpLeft] = useState(-100);
  const [isMuted, setIsMuted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [distance, setDistance] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Sound effects
  const jumpSound = useRef(new Audio('/sounds/jump.mp3'));
  const collectSound = useRef(new Audio('/sounds/collect.mp3'));
  const gameOverSound = useRef(new Audio('/sounds/gameover.mp3'));
  const powerUpSound = useRef(new Audio('/sounds/powerup.mp3'));

  // Different types of trash obstacles with their properties
  const trashTypes = [
    { emoji: '🗑️', points: 1, speed: 1 },
    { emoji: '🥤', points: 2, speed: 1.2 },
    { emoji: '🍕', points: 3, speed: 1.5 },
    { emoji: '📦', points: 2, speed: 1.3 },
    { emoji: '🧃', points: 2, speed: 1.4 },
    { emoji: '🍔', points: 3, speed: 1.6 }
  ];

  // Power-up types
  const powerUps = [
    { type: 'speed', emoji: '⚡', duration: 5000, effect: () => setGameSpeed(15) },
    { type: 'shield', emoji: '🛡️', duration: 3000, effect: () => setPowerUpActive(true) },
    { type: 'double', emoji: '2️⃣', duration: 5000, effect: () => setPowerUpType('double') }
  ];

  // Runner animation frames with different poses
  const runnerFrames = [
    '🏃‍♂️', // Running frame 1
    '🏃',   // Running frame 2
    '🏃‍♂️', // Running frame 3
    '🏃'    // Running frame 4
  ];
  const [currentFrame, setCurrentFrame] = useState(0);

  // Handle sound effects
  const playSound = (sound) => {
    if (!isMuted && sound.current) {
      sound.current.currentTime = 0;
      sound.current.play();
    }
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(() => {
        setObstacleLeft((prev) => (prev > 0 ? prev - trashTypes[obstacleType].speed : 100));
        setPowerUpLeft((prev) => (prev > 0 ? prev - 1 : Math.random() > 0.95 ? 100 : -100));
        setCurrentFrame((prev) => (prev + 1) % runnerFrames.length);
        setDistance(prev => prev + 0.1);
      }, gameSpeed);

      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, gameSpeed, obstacleType]);

  useEffect(() => {
    if (obstacleLeft === 10 && !jumping && !powerUpActive) {
      setGameOver(true);
      playSound(gameOverSound);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('greenRunnerHighScore', score);
      }
    }

    if (obstacleLeft === 0) {
      const points = powerUpType === 'double' ? trashTypes[obstacleType].points * 2 : trashTypes[obstacleType].points;
      setScore(score + points);
      setCombo(combo + 1);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 1000);
      setObstacleType((prev) => (prev + 1) % trashTypes.length);
    }
  }, [obstacleLeft]);

  // Power-up collision detection
  useEffect(() => {
    if (powerUpLeft === 10 && !jumping) {
      const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
      setPowerUpType(randomPowerUp.type);
      playSound(powerUpSound);
      randomPowerUp.effect();
      setTimeout(() => {
        setPowerUpActive(false);
        setPowerUpType(null);
        if (randomPowerUp.type === 'speed') setGameSpeed(30);
      }, randomPowerUp.duration);
    }
  }, [powerUpLeft]);

  const jump = () => {
    if (!jumping && gameStarted && !gameOver) {
      setJumping(true);
      playSound(jumpSound);
      setTimeout(() => setJumping(false), 500);
    }
  };

  // Handle space key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        jump();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setDistance(0);
    setObstacleLeft(100);
    setShowTutorial(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setDistance(0);
    setObstacleLeft(100);
    setPowerUpActive(false);
    setPowerUpType(null);
    setGameSpeed(30);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-blue-400 to-green-400">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Clouds */}
        <div className="absolute top-10 left-10 text-6xl animate-float">☁️</div>
        <div className="absolute top-20 right-20 text-6xl animate-float-delayed">☁️</div>
        <div className="absolute top-30 left-1/3 text-6xl animate-float-slow">☁️</div>
        <div className="absolute top-40 right-1/4 text-6xl animate-float">☁️</div>
        
        {/* Trees */}
        <div className="absolute bottom-0 left-1/4 text-6xl">🌳</div>
        <div className="absolute bottom-0 right-1/4 text-6xl">🌳</div>
        <div className="absolute bottom-0 left-1/2 text-6xl">🌳</div>
        <div className="absolute bottom-0 right-1/3 text-6xl">🌳</div>
        <div className="absolute bottom-0 left-1/3 text-6xl">🌳</div>
      </div>

      {/* Game UI */}
      <div className="relative flex-1">
        {/* Score display */}
        <div className="absolute top-4 left-4 z-20 bg-white/80 px-6 py-3 rounded-lg shadow-lg">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-green-600">Score: {score}</h2>
            <h3 className="text-xl text-gray-600">High Score: {highScore}</h3>
            <p className="text-lg text-blue-600">Distance: {distance.toFixed(1)}m</p>
          </div>
        </div>

        {/* Combo display */}
        {showCombo && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-yellow-400 animate-bounce">
            {combo}x Combo!
          </div>
        )}

        {/* Game area */}
        <div className="absolute inset-0">
          {/* Ground */}
          <div className="absolute bottom-0 w-full h-24 bg-green-600"></div>
          
          {/* Player */}
          <div
            className={`absolute bottom-24 left-20 text-7xl transition-transform duration-300 ${
              jumping ? "-translate-y-32" : ""
            } ${powerUpActive ? "animate-pulse" : ""}`}
          >
            {runnerFrames[currentFrame]}
            {powerUpActive && <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl">🛡️</span>}
          </div>
          
          {/* Obstacle (Trash) */}
          <div
            className="absolute bottom-24 text-7xl transition-transform duration-100"
            style={{ left: `${obstacleLeft}%` }}
          >
            {trashTypes[obstacleType].emoji}
          </div>

          {/* Power-up */}
          {powerUpLeft > 0 && (
            <div
              className="absolute bottom-32 text-5xl animate-bounce"
              style={{ left: `${powerUpLeft}%` }}
            >
              {powerUps.find(p => p.type === powerUpType)?.emoji || '⭐'}
            </div>
          )}
        </div>

        {/* Start/Reset Button */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white/90 p-8 rounded-xl shadow-xl text-center">
              <h1 className="text-4xl font-bold text-green-600 mb-4">Green Runner</h1>
              <p className="text-xl mb-6">Help clean up the environment by collecting trash!</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white text-2xl rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-200 font-bold"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white/90 p-8 rounded-xl shadow-xl text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
              <p className="text-2xl mb-4">Final Score: {score}</p>
              <p className="text-xl mb-2">High Score: {highScore}</p>
              <p className="text-lg mb-6">Distance: {distance.toFixed(1)}m</p>
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-green-600 text-white text-xl rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-200 font-bold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Jump button */}
        {gameStarted && !gameOver && (
          <button
            onClick={jump}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 bg-green-600 text-white text-xl rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-200 font-bold"
          >
            Jump!
          </button>
        )}

        {/* Instructions */}
        <div className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-lg">Press Space or click Jump to avoid trash!</p>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 bg-white/80 p-2 rounded-lg shadow-lg"
        >
          {isMuted ? <FaVolumeMute className="w-6 h-6" /> : <FaVolumeUp className="w-6 h-6" />}
        </button>

        {/* Tutorial */}
        {showTutorial && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white/90 p-8 rounded-xl shadow-xl text-center max-w-md">
              <h2 className="text-2xl font-bold text-green-600 mb-4">How to Play</h2>
              <ul className="text-left space-y-2 mb-6">
                <li>• Press Space or click Jump to avoid trash</li>
                <li>• Collect power-ups for special abilities</li>
                <li>• Build up your combo for higher scores</li>
                <li>• Different trash items give different points</li>
              </ul>
              <button
                onClick={() => setShowTutorial(false)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
