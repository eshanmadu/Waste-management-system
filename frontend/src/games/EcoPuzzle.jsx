import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid } from '@mui/material';
import puzzleImage from '../assets/react.svg'; // You can replace this with your preferred image

export default function EcoPuzzle() {
  const [puzzle, setPuzzle] = useState([]);
  const [shuffledPuzzle, setShuffledPuzzle] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);

  // Initialize puzzle
  useEffect(() => {
    const initialPuzzle = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      value: puzzleImage,
      correctPosition: i
    }));
    setPuzzle(initialPuzzle);
    setShuffledPuzzle([...initialPuzzle]);
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (gameStarted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      shufflePuzzle();
    }
    return () => clearInterval(timer);
  }, [gameStarted, countdown]);

  // Check if puzzle is solved
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const isSolved = shuffledPuzzle.every((tile, index) => tile.correctPosition === index);
      if (isSolved) {
        setGameOver(true);
      }
    }
  }, [shuffledPuzzle, gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setCountdown(5);
    setMoves(0);
    setGameOver(false);
  };

  const shufflePuzzle = () => {
    const shuffled = [...puzzle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledPuzzle(shuffled);
  };

  const handleTileClick = (index) => {
    if (!gameStarted || gameOver) return;

    if (selectedTile === null) {
      setSelectedTile(index);
    } else {
      // Swap tiles
      const newPuzzle = [...shuffledPuzzle];
      [newPuzzle[selectedTile], newPuzzle[index]] = [newPuzzle[index], newPuzzle[selectedTile]];
      setShuffledPuzzle(newPuzzle);
      setSelectedTile(null);
      setMoves(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCountdown(5);
    setMoves(0);
    setGameOver(false);
    setSelectedTile(null);
    setShuffledPuzzle([...puzzle]);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f0f0f0', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      pt: 4
    }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Eco Puzzle
      </Typography>

      {!gameStarted && !gameOver && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Memorize the puzzle pattern in 5 seconds!
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

      {gameStarted && countdown > 0 && (
        <Typography variant="h2" sx={{ mb: 4 }}>
          {countdown}
        </Typography>
      )}

      <Grid container spacing={1} sx={{ maxWidth: 400, mb: 4 }}>
        {shuffledPuzzle.map((tile, index) => (
          <Grid item xs={4} key={tile.id}>
            <Box
              onClick={() => handleTileClick(index)}
              sx={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                bgcolor: selectedTile === index ? '#e3f2fd' : 'white',
                border: '2px solid #2196f3',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#e3f2fd',
                },
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src={tile.value}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {gameStarted && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          Moves: {moves}
        </Typography>
      )}

      {gameOver && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Congratulations! You solved the puzzle in {moves} moves!
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={resetGame}
          >
            Play Again
          </Button>
        </Box>
      )}
    </Box>
  );
}