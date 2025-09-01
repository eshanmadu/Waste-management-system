import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Alert,
  Chip,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import { EmojiEvents, Psychology, School, Timer } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// green theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green 800
      light: '#4caf50', // Green 500
      dark: '#1b5e20', // Green 900
    },
    secondary: {
      main: '#81c784', // Green 300
    },
    success: {
      main: '#43a047', // Green 600
    },
    info: {
      main: '#66bb6a', // Green 400
    },
  },
});

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/quiz');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched questions:', data);
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        console.log('Selected questions:', selected);
        setQuestions(selected);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to fetch questions. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerSelect = (event) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(event.target.value);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    } else {
      setShowCorrectAnswer(true);
    }
    setIsAnswerSubmitted(true);

    // 2 sec wait time between questions
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setShowCorrectAnswer(false);
        setIsAnswerSubmitted(false);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setShowResult(false);
    setShowCorrectAnswer(false);
    setIsAnswerSubmitted(false);
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setQuestions(selected);
  };

  const handleStartQuiz = () => {
    setShowIntro(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ marginTop: '80px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ marginTop: '80px' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ marginTop: '80px' }}>
        <Alert severity="info">No questions available at the moment.</Alert>
      </Box>
    );
  }

  if (showIntro) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="md" sx={{ marginTop: '80px', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: '#f1f8e9' }}>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              Welcome to the Waste Management Quiz!
            </Typography>
            
            <Typography variant="h6" gutterBottom align="center" sx={{ mt: 2 }}>
              Test your knowledge and learn about proper waste management practices
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Test Your Knowledge</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Challenge yourself with questions about waste management, recycling, and environmental conservation.
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <School sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Learn New Facts</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Discover interesting facts about waste decomposition, recycling processes, and sustainable practices.
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Timer sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Quick & Engaging</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Complete 5 questions in just a few minutes. Perfect for a quick learning break!
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmojiEvents sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Track Your Progress</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  See your score at the end and challenge yourself to improve with each attempt.
                </Typography>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="center" mt={4}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleStartQuiz}
                sx={{ px: 4, py: 1.5 }}
              >
                Start Quiz
              </Button>
            </Box>
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

  if (showResult) {
    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="80vh" p={3} sx={{ marginTop: '80px' }}>
          <Card sx={{ maxWidth: 600, width: '100%', bgcolor: '#f1f8e9' }}>
            <CardContent>
              <Typography variant="h4" gutterBottom align="center" color="primary">
                Quiz Results
              </Typography>
              <Typography variant="h6" gutterBottom align="center">
                Your Score: {score} out of 5
              </Typography>
              <Typography variant="body1" gutterBottom align="center" color="text.secondary">
                {score === 5 ? "Excellent! You got all questions right!" :
                 score >= 3 ? "Good job! You passed the quiz!" :
                 "Keep practicing to improve your score!"}
              </Typography>
              <Box display="flex" justifyContent="center" mt={3}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRestart}
                  sx={{ 
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  Try Another Quiz
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="80vh" p={3} sx={{ marginTop: '80px' }}>
        <Card sx={{ maxWidth: 600, width: '100%', bgcolor: '#f1f8e9' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Chip
                label={`Question ${currentQuestionIndex + 1} of 5`}
                color="primary"
              />
              <Chip
                label={`Score: ${score}`}
                color="secondary"
              />
            </Box>
            
            <Typography variant="h6" gutterBottom color="primary">
              {currentQuestion.question}
            </Typography>

            <Chip
              label={currentQuestion.category}
              color="info"
              size="small"
              sx={{ mb: 2 }}
            />
            <Chip
              label={currentQuestion.difficulty}
              color="success"
              size="small"
              sx={{ ml: 1, mb: 2 }}
            />

            <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
              <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    disabled={isAnswerSubmitted}
                    sx={{
                      '&.Mui-disabled': {
                        color: option === currentQuestion.answer ? 'success.main' : 
                               option === selectedAnswer ? 'error.main' : 'text.primary'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {showCorrectAnswer && (
              <Alert severity="info" sx={{ mt: 2, bgcolor: '#e8f5e9' }}>
                Correct answer: {currentQuestion.answer}
              </Alert>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextQuestion}
                disabled={!selectedAnswer || isAnswerSubmitted}
                sx={{ 
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                {currentQuestionIndex === 4 ? 'Finish' : 'Next Question'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default Quiz;
