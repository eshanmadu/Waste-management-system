import { useState, useEffect } from "react";
import React from "react";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { 
  Mic, 
  MicOff, 
  Send, 
  HelpOutline, 
  VideoLibrary,
  Chat as ChatIcon,
} from "@mui/icons-material";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const HelpAndSupportPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const faqs = [
    { question: "How do I report waste?", answer: "Navigate to the 'Report Waste' page, fill in the details, and submit the form with location and photos." },
    { question: "How can I redeem points?", answer: "Points can be redeemed in the 'Rewards' section by selecting your preferred reward option." },
    { question: "What waste types can I report?", answer: "You can report plastic, paper, glass, metal, organic, e-waste, hazardous, textile, construction, and mixed waste." },
    { question: "How do I track my reports?", answer: "All your reports appear in the 'My Reports' section with their current status." },
  ];

  const videoTutorials = [
    {
      id: 1,
      title: "Getting Started with GoGreen360",
      description: "Learn how to create an account and navigate the platform",
      videoId: "mDTcxOrtcU0"
    },
    {
      id: 2,
      title: "How to Report Waste",
      description: "Step-by-step guide to reporting different types of waste",
      videoId: "dQw4w9WgXcQ"
    },
    {
      id: 3,
      title: "Understanding Rewards System",
      description: "How to earn and redeem points for rewards",
      videoId: "9bZkp7q19f0"
    },
    {
      id: 4,
      title: "Community Challenges",
      description: "Participating in and creating community clean-up events",
      videoId: "JGwWNGJdvx8"
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    { 
      sender: "bot", 
      text: "Hello! I'm your GoGreen360 assistant. I can help you with information about waste reporting, points and rewards, tracking your reports, participating in events, and more. What would you like to know?" 
    }
  ]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 300 : 20, 
    y: 200 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // eslint-disable-next-line no-unused-vars
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Initialize speech synthesis
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoicesLoaded(true);
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    
    // Load voices immediately if they're already available
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Speak welcome message when component mounts
  useEffect(() => {
    if (voicesLoaded) {
      speakMessage("Hi, How can I help you today?");
    }
  }, [voicesLoaded]);

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1;
      utterance.rate = 1.3;
      utterance.pitch = 0.9;

      // Try to find a pleasant voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Karen')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => 
      prevIndex === videoTutorials.length - 1 ? 0 : prevIndex + 1
    );
  };

  // eslint-disable-next-line no-unused-vars
  const handlePrevVideo = () => {
    setCurrentVideoIndex((prevIndex) => 
      prevIndex === 0 ? videoTutorials.length - 1 : prevIndex - 1
    );
  };

  // eslint-disable-next-line no-unused-vars
  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
  };

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        ...prev,
        x: window.innerWidth - 300
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      const userMessage = { sender: "user", text: chatMessage };
      setChatLog(prev => [...prev, userMessage]);
      setChatMessage("");
      
      try {
        const response = await fetch('https://waste-management-system-88cb.onrender.com/api/ai-assistant/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ question: chatMessage })
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (data.success) {
          const botMessage = { sender: "bot", text: data.answer };
          setChatLog(prev => [...prev, botMessage]);
          speakMessage(data.answer);
        } else {
          const errorMessage = { 
            sender: "bot", 
            text: data.message || "I'm sorry, I encountered an error while processing your question. Please try again." 
          };
          setChatLog(prev => [...prev, errorMessage]);
          speakMessage(errorMessage.text);
        }
      } catch (error) {
        console.error('Error asking AI assistant:', error);
        let errorText = "I'm having trouble connecting right now. Please try again later.";
        
        if (error.message === 'Server returned non-JSON response') {
          errorText = "The server is not responding correctly. Please make sure the backend server is running.";
        } else if (error.message === 'Failed to fetch') {
          errorText = "Cannot connect to the server. Please check if the backend server is running.";
        }
        
        const errorMessage = { 
          sender: "bot", 
          text: errorText
        };
        setChatLog(prev => [...prev, errorMessage]);
        speakMessage(errorMessage.text);
      }
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript) {
        setChatMessage(transcript);
        resetTranscript();
      }
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
        <Typography color="error">
          Your browser doesn't support speech recognition. Try Chrome or Edge.
        </Typography>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 4, 
        mb: 10,
        pt: isMobile ? 4 : 10,
        minHeight: '80vh',
        position: 'relative'
      }}
    >
      {/* Draggable Voice Assistant Widget */}
      <Box 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          position: "fixed",
          top: position.y,
          left: position.x,
          width: 260,
          height: 320,
          bgcolor: "rgba(18, 18, 18, 0.7)",
          backdropFilter: "blur(15px)",
          borderRadius: 6,
          boxShadow: "0 0 25px #00ffe0, 0 0 45px #00c8ff",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 2000,
          animation: "fadeIn 1s ease-out",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
          '&:active': {
            cursor: "grabbing",
          }
        }}
      >
        <Typography variant="h6" sx={{
          color: "#00ffe0",
          textAlign: "center",
          fontWeight: "bold",
          letterSpacing: 1,
        }}>
          Voice Assistant
        </Typography>

        <Box
          onClick={toggleListening}
          sx={{
            mt: 2,
            width: 90,
            height: 90,
            background: listening 
              ? "radial-gradient(circle, #ff0040, #8e0034)" 
              : "radial-gradient(circle, #00ffe0, #0073ff)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: listening 
              ? "0 0 25px #ff0040, 0 0 50px #ff0040" 
              : "0 0 25px #00ffe0, 0 0 50px #00c8ff",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <IconButton sx={{ color: "#fff", fontSize: 42 }}>
            {listening ? <MicOff fontSize="inherit" /> : <Mic fontSize="inherit" />}
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{
          mt: 2,
          color: "#bbb",
          fontStyle: "italic",
          textAlign: "center",
        }}>
          {listening ? "Listening..." : "Tap to start speaking"}
        </Typography>

        <Box sx={{
          mt: 2,
          width: "100%",
          height: 100,
          overflowY: "auto",
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 4,
          p: 1,
          color: "#00ffe0",
          fontSize: "0.85rem",
          fontFamily: "monospace",
          boxShadow: "inset 0 0 10px rgba(0,255,255,0.2)",
        }}>
          {transcript ? (
            transcript.length > 80 ? transcript.substring(0, 80) + "..." : transcript
          ) : (
            "Say something like 'How do I report waste?'"
          )}
        </Box>
      </Box>

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>

      <Box textAlign="center" mb={4}>
        <Typography variant={isMobile ? "h4" : "h3"} component="h1" gutterBottom sx={{ color: 'darkgreen' }}>
          Help & Support Center
        </Typography>
        <Typography variant="subtitle1">
          Get assistance with any aspect of the GoGreen360 platform
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: "primary.main" }}><HelpOutline /></Avatar>}
              title="Frequently Asked Questions"
              subheader="Find answers to common questions"
            />
            <CardContent>
              <TextField
                fullWidth
                label="Search FAQs"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              {filteredFAQs.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {filteredFAQs.map((faq, index) => (
                    <div key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={faq.question}
                          secondary={faq.answer}
                          primaryTypographyProps={{ fontWeight: "medium" }}
                        />
                      </ListItem>
                      {index < filteredFAQs.length - 1 && <Divider component="li" />}
                    </div>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No matching FAQs found
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: "secondary.main" }}><VideoLibrary /></Avatar>}
              title="Video Tutorials"
              subheader="Scroll horizontally to browse tutorials"
            />
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                py: 2,
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '4px',
                },
              }}>
                {videoTutorials.map((video) => (
                  <Box 
                    key={video.id}
                    sx={{
                      minWidth: '300px',
                      scrollSnapAlign: 'start',
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: 2,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ 
                      position: "relative", 
                      paddingBottom: "56.25%", 
                      backgroundColor: '#000' 
                    }}>
                      <iframe
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none"
                        }}
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        allowFullScreen
                        loading="lazy"
                      />
                    </Box>
                    
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {video.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {video.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={3} sx={{ mb: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: "success.main" }}><ChatIcon /></Avatar>}
              title="AI Assistant"
              subheader="Get instant answers to your questions"
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
              <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2, backgroundColor: "#f5f5f5", minHeight: 300, maxHeight: 400 }}>
                {chatLog.map((message, index) => (
                  <Box key={index} sx={{ mb: 2, textAlign: message.sender === "user" ? "right" : "left" }}>
                    <Paper
                      elevation={0}
                      sx={{
                        display: "inline-block",
                        p: 1.5,
                        bgcolor: message.sender === "user" ? "primary.light" : "grey.100",
                        borderRadius: message.sender === "user" 
                          ? "18px 18px 0 18px" 
                          : "18px 18px 18px 0",
                        maxWidth: '80%'
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    size="small"
                  />
                  <IconButton color={listening ? "error" : "default"} onClick={toggleListening}>
                    {listening ? <MicOff /> : <Mic />}
                  </IconButton>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    sx={{ minWidth: 'auto' }}
                  >
                    <Send />
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HelpAndSupportPage;