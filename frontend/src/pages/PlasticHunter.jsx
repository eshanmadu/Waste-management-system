import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PlasticHunter = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [powerUpTimer, setPowerUpTimer] = useState(0);

  // Game objects
  const player = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    speed: 5,
    isJumping: false,
    jumpForce: 15,
    gravity: 0.8,
    velocityY: 0
  };

  const [plastics, setPlastics] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [marineLife, setMarineLife] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [gameLoop, setGameLoop] = useState(null);

  // Plastic types with different properties
  const plasticTypes = [
    { color: '#ffeb3b', points: 10, message: 'Single-use plastic bottles take 450 years to decompose!' },
    { color: '#ff9800', points: 15, message: 'Plastic bags can kill marine animals that mistake them for food!' },
    { color: '#f44336', points: 20, message: 'Microplastics are found in 90% of bottled water!' }
  ];

  // Power-up types
  const powerUpTypes = [
    { color: '#4caf50', effect: 'shield', duration: 10, message: 'Shield activated! You\'re temporarily invincible!' },
    { color: '#2196f3', effect: 'speed', duration: 8, message: 'Speed boost! Move faster!' },
    { color: '#9c27b0', effect: 'magnet', duration: 12, message: 'Magnet power! Attract nearby plastics!' }
  ];

  // Initialize game
  useEffect(() => {
    if (gameStarted) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;

      // Start game loop
      const loop = setInterval(() => {
        update();
        draw(ctx);
      }, 1000 / 60);

      setGameLoop(loop);

      // Cleanup
      return () => clearInterval(loop);
    }
  }, [gameStarted]);

  // Power-up timer effect
  useEffect(() => {
    let timer;
    if (powerUpActive && powerUpTimer > 0) {
      timer = setInterval(() => {
        setPowerUpTimer(prev => {
          if (prev <= 1) {
            setPowerUpActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [powerUpActive, powerUpTimer]);

  // Game update logic
  const update = () => {
    // Update player
    if (player.isJumping) {
      player.velocityY += player.gravity;
      player.y += player.velocityY;

      // Ground collision
      if (player.y > 500) {
        player.y = 500;
        player.isJumping = false;
        player.velocityY = 0;
      }
    }

    // Update plastics
    setPlastics(prev => {
      return prev.map(plastic => ({
        ...plastic,
        x: plastic.x - 3
      })).filter(plastic => plastic.x > -50);
    });

    // Update hazards
    setHazards(prev => {
      return prev.map(hazard => ({
        ...hazard,
        x: hazard.x - 4
      })).filter(hazard => hazard.x > -50);
    });

    // Update marine life
    setMarineLife(prev => {
      return prev.map(life => ({
        ...life,
        x: life.x - 2
      })).filter(life => life.x > -50);
    });

    // Update power-ups
    setPowerUps(prev => {
      return prev.map(powerUp => ({
        ...powerUp,
        x: powerUp.x - 2
      })).filter(powerUp => powerUp.x > -50);
    });

    // Spawn new objects
    if (Math.random() < 0.02) {
      spawnPlastic();
    }
    if (Math.random() < 0.01) {
      spawnHazard();
    }
    if (Math.random() < 0.005) {
      spawnMarineLife();
    }
    if (Math.random() < 0.003) {
      spawnPowerUp();
    }

    // Check collisions
    checkCollisions();
  };

  // Drawing logic
  const draw = (ctx) => {
    // Clear canvas
    ctx.fillStyle = '#1a237e';
    ctx.fillRect(0, 0, 800, 600);

    // Draw background elements
    drawBackground(ctx);

    // Draw player with shield effect if active
    if (powerUpActive && powerUpTimer > 0) {
      ctx.beginPath();
      ctx.arc(player.x + player.width/2, player.y + player.height/2, 40, 0, Math.PI * 2);
      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw plastics with different colors
    plastics.forEach(plastic => {
      ctx.fillStyle = plasticTypes[plastic.type].color;
      ctx.fillRect(plastic.x, plastic.y, 30, 30);
    });

    // Draw hazards
    hazards.forEach(hazard => {
      ctx.fillStyle = '#f44336';
      ctx.fillRect(hazard.x, hazard.y, 40, 40);
    });

    // Draw marine life
    marineLife.forEach(life => {
      ctx.fillStyle = '#2196f3';
      ctx.fillRect(life.x, life.y, 40, 40);
    });

    // Draw power-ups
    powerUps.forEach(powerUp => {
      ctx.fillStyle = powerUpTypes[powerUp.type].color;
      ctx.beginPath();
      ctx.arc(powerUp.x + 15, powerUp.y + 15, 15, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw score and lives
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Lives: ${lives}`, 20, 60);
    
    // Draw power-up timer if active
    if (powerUpActive && powerUpTimer > 0) {
      ctx.fillText(`Power-up: ${powerUpTimer}s`, 20, 90);
    }
  };

  // Draw background elements
  const drawBackground = (ctx) => {
    // Draw bubbles
    for (let i = 0; i < 20; i++) {
      const x = (i * 40) % 800;
      const y = (i * 30) % 600;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }

    // Draw coral reef
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, 550, 800, 50);
  };

  // Spawn functions
  const spawnPlastic = () => {
    const type = Math.floor(Math.random() * plasticTypes.length);
    setPlastics(prev => [...prev, {
      x: 800,
      y: Math.random() * 400 + 50,
      type
    }]);
  };

  const spawnHazard = () => {
    setHazards(prev => [...prev, {
      x: 800,
      y: Math.random() * 400 + 50,
      type: Math.floor(Math.random() * 2)
    }]);
  };

  const spawnMarineLife = () => {
    setMarineLife(prev => [...prev, {
      x: 800,
      y: Math.random() * 400 + 50,
      type: Math.floor(Math.random() * 3)
    }]);
  };

  const spawnPowerUp = () => {
    const type = Math.floor(Math.random() * powerUpTypes.length);
    setPowerUps(prev => [...prev, {
      x: 800,
      y: Math.random() * 400 + 50,
      type
    }]);
  };

  // Collision detection
  const checkCollisions = () => {
    // Check plastic collisions
    plastics.forEach((plastic, index) => {
      if (isColliding(player, plastic)) {
        setPlastics(prev => prev.filter((_, i) => i !== index));
        setScore(prev => prev + plasticTypes[plastic.type].points);
        showEducationalMessage(plasticTypes[plastic.type].message);
      }
    });

    // Check hazard collisions
    hazards.forEach((hazard, index) => {
      if (isColliding(player, hazard)) {
        if (!powerUpActive) {
          setHazards(prev => prev.filter((_, i) => i !== index));
          setLives(prev => prev - 1);
          if (lives <= 1) {
            setGameOver(true);
          }
        }
      }
    });

    // Check marine life collisions
    marineLife.forEach((life, index) => {
      if (isColliding(player, life)) {
        setMarineLife(prev => prev.filter((_, i) => i !== index));
        setScore(prev => prev + 20);
        showEducationalMessage('Great job! You saved marine life from plastic pollution!');
      }
    });

    // Check power-up collisions
    powerUps.forEach((powerUp, index) => {
      if (isColliding(player, powerUp)) {
        setPowerUps(prev => prev.filter((_, i) => i !== index));
        activatePowerUp(powerUp.type);
      }
    });
  };

  // Activate power-up
  const activatePowerUp = (type) => {
    setPowerUpActive(true);
    setPowerUpTimer(powerUpTypes[type].duration);
    showEducationalMessage(powerUpTypes[type].message);
  };

  // Collision helper
  const isColliding = (obj1, obj2) => {
    return obj1.x < obj2.x + 30 &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + 30 &&
           obj1.y + obj1.height > obj2.y;
  };

  // Show educational message
  const showEducationalMessage = (message) => {
    setInfoMessage(message);
    setShowInfo(true);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) return;

      switch(e.key) {
        case 'ArrowUp':
        case 'w':
          if (!player.isJumping) {
            player.isJumping = true;
            player.velocityY = -player.jumpForce;
          }
          break;
        case 'ArrowLeft':
        case 'a':
          player.x = Math.max(0, player.x - player.speed);
          break;
        case 'ArrowRight':
        case 'd':
          player.x = Math.min(750, player.x + player.speed);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted]);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setPlastics([]);
    setHazards([]);
    setMarineLife([]);
    setPowerUps([]);
    setPowerUpActive(false);
    setPowerUpTimer(0);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    if (gameLoop) {
      clearInterval(gameLoop);
    }
    startGame();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#000', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      pt: 4
    }}>
      <Typography variant="h3" sx={{ color: '#fff', mb: 2 }}>
        Plastic Hunter: Ocean Rescue
      </Typography>

      {!gameStarted && !gameOver && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Help clean the ocean and save marine life!
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={startGame}
          >
            Start Game
          </Button>
        </Box>
      )}

      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #fff',
          borderRadius: '8px',
          maxWidth: '100%'
        }}
      />

      {gameOver && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>
            Game Over! Your score: {score}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={resetGame}
            sx={{ mr: 2 }}
          >
            Play Again
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/games')}
          >
            Back to Games
          </Button>
        </Box>
      )}

      <Dialog open={showInfo} onClose={() => setShowInfo(false)}>
        <DialogTitle>Did You Know?</DialogTitle>
        <DialogContent>
          <Typography>{infoMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInfo(false)}>Continue</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 2, color: '#fff' }}>
        <Typography variant="h6">Controls:</Typography>
        <Typography>↑ or W: Jump</Typography>
        <Typography>← or A: Move Left</Typography>
        <Typography>→ or D: Move Right</Typography>
      </Box>
    </Box>
  );
};

export default PlasticHunter; 