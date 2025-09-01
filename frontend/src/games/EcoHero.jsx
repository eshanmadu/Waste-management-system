import React, { useState, useEffect, useCallback } from "react";
import Confetti from 'react-dom-confetti';

export default function EcoHero() {
  // Game state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [items, setItems] = useState([]);
  const [upgrades, setUpgrades] = useState([
    { id: 1, name: "Recycling Gloves", cost: 10, multiplier: 2, purchased: false },
    { id: 2, name: "Trash Grabber", cost: 25, multiplier: 3, purchased: false },
    { id: 3, name: "Eco Team", cost: 50, multiplier: 5, purchased: false },
  ]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Different types of trash with different point values
  const trashTypes = [
    { emoji: "🗑️", points: 1 },
    { emoji: "🍎", points: 2 },
    { emoji: "📰", points: 3 },
    { emoji: "🥫", points: 4 },
    { emoji: "🔋", points: 5, special: true },
  ];

  // Generate random items
  const generateItem = useCallback(() => {
    if (!playing || items.length >= 5) return;
    
    const randomType = Math.random() > 0.9 ? trashTypes[4] : 
                      Math.random() > 0.7 ? trashTypes[3] : 
                      Math.random() > 0.5 ? trashTypes[2] : 
                      Math.random() > 0.3 ? trashTypes[1] : 
                      trashTypes[0];
    
    const newItem = {
      id: Date.now(),
      emoji: randomType.emoji,
      points: randomType.points,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      special: randomType.special || false,
    };
    
    setItems(prev => [...prev, newItem]);
    
    // Remove item after 3 seconds if not clicked
    setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== newItem.id));
    }, 3000);
  }, [playing, items.length]);

  // Game timer and item generation
  useEffect(() => {
    if (playing && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      const itemInterval = setInterval(generateItem, 800 - (level * 100));
      
      return () => {
        clearTimeout(timer);
        clearInterval(itemInterval);
      };
    }
    
    if (timeLeft === 0 && playing) {
      setPlaying(false);
      if (score > highScore) {
        setHighScore(score);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      // Level up if score is high enough
      if (score >= level * 50) {
        setLevel(prev => prev + 1);
      }
    }
  }, [playing, timeLeft, generateItem, score, highScore, level]);

  const handleClickItem = (id, points) => {
    if (!playing) return;
    
    setScore(prev => prev + (points * multiplier));
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const buyUpgrade = (upgrade) => {
    if (score >= upgrade.cost && !upgrade.purchased) {
      setScore(prev => prev - upgrade.cost);
      setMultiplier(prev => prev * upgrade.multiplier);
      setUpgrades(prev => 
        prev.map(u => 
          u.id === upgrade.id ? {...u, purchased: true} : u
        )
      );
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setPlaying(true);
    setItems([]);
    setMultiplier(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4 relative">
      <Confetti active={showConfetti} config={{ spread: 90, elementCount: 100 }} />
      
      <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow">
        <p className="text-sm">High Score: <span className="font-bold">{highScore}</span></p>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-green-700">🌍 Eco Hero Cleanup</h2>
        <p className="text-lg mb-4">Level {level} - Tap the garbage to clean the planet!</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-2">Game Stats</h3>
          <p className="mb-1">Time Left: <span className="font-bold">{timeLeft}s</span></p>
          <p className="mb-1">Score: <span className="font-bold">{score}</span></p>
          <p className="mb-1">Multiplier: <span className="font-bold">x{multiplier}</span></p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-2">Upgrades</h3>
          {upgrades.map(upgrade => (
            <button
              key={upgrade.id}
              onClick={() => buyUpgrade(upgrade)}
              disabled={score < upgrade.cost || upgrade.purchased || !playing}
              className={`block w-full mb-2 p-2 rounded ${upgrade.purchased ? 'bg-gray-300' : score >= upgrade.cost ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200'} text-white`}
            >
              {upgrade.name} (Cost: {upgrade.cost}) {upgrade.purchased && '✔'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-64 bg-green-100 rounded-xl shadow-inner mb-8 overflow-hidden">
        {playing ? (
          items.map(item => (
            <button
              key={item.id}
              onClick={() => handleClickItem(item.id, item.points)}
              className={`absolute text-4xl transform hover:scale-110 transition-transform ${item.special ? 'animate-bounce' : ''}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {item.emoji}
            </button>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={startGame}
              className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-700 text-xl font-bold"
            >
              {score > 0 ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>Level up every 50 points. Faster trash spawns at higher levels!</p>
        <p>Special items (🔋) give bonus points!</p>
      </div>
    </div>
  );
}