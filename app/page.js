'use client'
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, AppBar, Toolbar, Typography, Button, Box, Grid, Paper, IconButton, CssBaseline,
  useMediaQuery, Grow, Zoom, List, ListItem, ListItemIcon, ListItemText,  Menu, MenuItem
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FileUploadSummarize from "./fileUploader/page";
import ApiIcon from '@mui/icons-material/Api';
import UploadIcon from '@mui/icons-material/Upload';
import ChatIcon from '@mui/icons-material/Chat';
import DoneIcon from '@mui/icons-material/Done';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
import { School, Science } from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import MenuIcon from '@mui/icons-material/Menu';
import getStripe from "@/utils/get-stripe";

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(156, 39, 176, 0.3), 0 0 10px rgba(156, 39, 176, 0.2);
  }
  50% {
    box-shadow: 0 0 10px rgba(156, 39, 176, 0.5), 0 0 20px rgba(156, 39, 176, 0.3);
  }
  100% {
    box-shadow: 0 0 5px rgba(156, 39, 176, 0.3), 0 0 10px rgba(156, 39, 176, 0.2);
  }
`;

const ContactSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const containerStyle = {
    maxWidth: '1000px',
    margin: '64px auto',
    padding: '32px',
    background: (theme) => theme.palette.mode === 'dark' ? '#2c2c2c' : '#f0f0ff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
  };

  const headingStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: (theme) => theme.palette.mode === 'dark' ? '#9C27B0' : '#f0f0ff',
    textAlign: 'center',
  };

  const paragraphStyle = {
    fontSize: '18px',
    color: '#4B5563',
    textAlign: 'center',
    maxWidth: '600px',
  };

  const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#f0f0ff',
    color: (theme) => theme.palette.mode === 'dark' ? '#9C27B0' : '#f0f0ff',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleJoinDiscord = () => {
    router.push('https://discord.gg/2vnQ39g2h4');
  };

  return (
    <div 
      style={containerStyle} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={contentStyle}>
        <h2 style={headingStyle}>Stay in the Loop and Get QUICK Support!</h2>
        <p style={paragraphStyle}>
          Join our dynamic Discord community for real-time updates, instant support, and engaging conversations. 
          Connect with experts, explore new features, and be part of a thriving ecosystem of innovation and collaboration.
        </p>
        <img
          src="bot.png"
          alt="Bot Image"
          width={200}
          height={200}
          style={{
            borderRadius: '50%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'rotate(360deg)' : 'rotate(0)',
          }}
        />
        <button 
          style={buttonStyle} 
          onClick={handleJoinDiscord}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3730A3'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
        >

          Join our Discord Server
        </button>
      </div>
    </div>
  );
};


const VideoSectionOne = () => {
  const videoRef = useRef(null);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '640px',  
      margin: '0 auto',   
    }}>
      <div style={{ 
        position: 'relative',
        paddingTop: '56.25%', 
        overflow: 'hidden',
        boxShadow: '0 0 20px 5px rgba(156, 39, 176, 0.7)',
        borderRadius: '15px'
      }}>
        <video 
          ref={videoRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',  
          }}
          autoPlay
          muted
          playsInline
          loop>
          <source src="/video/FirstVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <style>
        {`
          @keyframes glow {
            from {
              box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.4);
            }
            to {
              box-shadow: 0 0 20px 5px rgba(0, 255, 255, 1);
            }
          }
        `}
      </style>
    </div>
  );
};

const VideoSectionTwo = () => {
  const videoRef = useRef(null);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '640px',  
      margin: '0 auto',   
    }}>
      <div style={{ 
        position: 'relative',
        paddingTop: '56.25%', 
        overflow: 'hidden',
        boxShadow: '0 0 20px 5px rgba(156, 39, 176, 0.7)',
        borderRadius: '15px'
      }}>
        <video 
          ref={videoRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',  
          }}
          autoPlay
          muted
          playsInline
          loop>
          <source src="/video/SecondVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <style>
        {`
          @keyframes glow {
            from {
              box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.4);
            }
            to {
              box-shadow: 0 0 20px 5px rgba(0, 255, 255, 1);
            }
          }
        `}
      </style>
    </div>
  );
};

const VideoSectionThree = () => {
  const videoRef = useRef(null);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '640px',  
      margin: '0 auto',   
    }}>
      <div style={{ 
        position: 'relative',
        paddingTop: '56.25%', 
        overflow: 'hidden',
        boxShadow: '0 0 20px 5px rgba(156, 39, 176, 0.7)',
        borderRadius: '15px'
      }}>
        <video 
          ref={videoRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',  
          }}
          autoPlay
          muted
          playsInline
          loop>
          <source src="/video/ThirdVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <style>
        {`
          @keyframes glow {
            from {
              box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.4);
            }
            to {
              box-shadow: 0 0 20px 5px rgba(0, 255, 255, 1);
            }
          }
        `}
      </style>
    </div>
  );
};

const VideoSectionFour = () => {
  const videoRef = useRef(null);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '640px',  
      margin: '0 auto',   
    }}>
      <div style={{ 
        position: 'relative',
        paddingTop: '56.25%', 
        overflow: 'hidden',
        boxShadow: '0 0 20px 5px rgba(156, 39, 176, 0.7)',
        borderRadius: '15px'
      }}>
        <video 
          ref={videoRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',  
          }}
          autoPlay
          muted
          playsInline
          loop>
          <source src="/video/FourthVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <style>
        {`
          @keyframes glow {
            from {
              box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.4);
            }
            to {
              box-shadow: 0 0 20px 5px rgba(0, 255, 255, 1);
            }
          }
        `}
      </style>
    </div>
  );
};

// Enhanced FeatureCard component
const FeatureCard = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000 + index * 500}>
      <Paper
        elevation={isHovered ? 8 : 1}
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'all 0.3s ease-in-out',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2c2c2c' : '#f0f0ff',
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ fontSize: 48, color: 'theme.palette.icons', mb: 2 }}>{feature.icon}</Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {feature.title}
        </Typography>
        <Typography variant="body1">{feature.description}</Typography>
      </Paper>
    </Grow>
  );
};

// Enhanced StepBox component
const StepBox = ({ step, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 500}ms` }}>
      <Box 
        sx={{ 
          textAlign: 'center',
          transition: 'all 0.3s ease-in-out',
          transform: isHovered ? 'translateY(-10px)' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ 
          fontSize: 64, 
          mb: 2, 
          color: 'theme.palette.icons',
          transform: isHovered ? 'rotate(360deg)' : 'none',
          transition: 'transform 0.5s ease-in-out'
        }}>
          {step.icon}
        </Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>{step.title}</Typography>
        <Typography variant="body1">{step.description}</Typography>
      </Box>
    </Zoom>
  );
};

// Enhanced UseCaseCard component
const UseCaseCard = ({ useCase, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = useCase.icon;

  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000 + index * 500}>
      <Box
        sx={{
          ml: 4,
          mr: 4,
          height: '100%',
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            animation: isHovered ? `${glowAnimation} 2s ease-in-out infinite` : 'none',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          },
        }}
      >
        <Paper 
          elevation={isHovered ? 8 : 0}
          sx={{ 
            p: 3, 
            height: '100%',
            transition: 'all 0.3s ease-in-out',
            backgroundColor: (theme) => 
              isHovered 
                ? theme.palette.mode === 'dark' ? '#2c2c2c' : '#f0f0ff'
                : theme.palette.background.paper,
            transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            position: 'relative',
            zIndex: 1,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <Icon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: (theme) => theme.components.contained,
              }}
            >
              {useCase.title}
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            sx={{
              mb: 2,
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {useCase.description}
          </Typography>
          <List>
            {useCase.benefits.map((benefit, idx) => (
              <ListItem key={idx} dense>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: (theme) => theme.palette.secondary.main,
                    }}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={benefit}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: (theme) => theme.palette.text.primary,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Grow>
  );
};

const PricingCard = ({ plan, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Stripe
  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
    })

    const checkoutSessionJson = await checkoutSession.json()
    
    if (checkoutSession.statusCode === 500){
      console.error(checkoutSession.message)
      return
    }

    const stripe = await getStripe()
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id, 
    })

    if (error) {
      console.warn(error.message)
    }
  }

  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 500}ms` }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -3,
            left: -3,
            right: -3,
            bottom: -3,
            borderRadius: '18px',
            background: 'rgba(156, 39, 176, 0.7)',
            filter: 'blur(8px)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            animation: isHovered ? 'glow 1.5s ease-in-out infinite alternate' : 'none',
          },
          '@keyframes glow': {
            '0%': {
              boxShadow: '0 0 10px 2px rgba(156, 39, 176, 0.4)',
            },
            '100%': {
              boxShadow: '0 0 20px 5px rgba(156, 39, 176, 1)',
            },
          },
        }}
      >
        <Paper 
          elevation={isHovered ? 8 : 1}
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            transition: 'all 0.3s ease-in-out',
            borderRadius: '15px',
            position: 'relative',
            zIndex: 1,
            backgroundColor: (theme) => 
              isHovered 
                ? theme.palette.mode === 'dark' ? '#2c2c2c' : '#f0f0ff'
                : theme.palette.background.paper,
            transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
              {plan.name}
            </Typography>
            <Typography 
              variant="h4" 
              color='text.primary'
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                my: 2,
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(230, 230, 250, 1)',
                padding: '10px',
                borderRadius: '10px',
                display: 'inline-block'
              }}
            >
              {plan.price}
            </Typography>
            <Typography variant="body2" paragraph sx={{ mb: 2 }}>
              {plan.description}
            </Typography>
            <List sx={{ textAlign: 'left', mb: 2 }}>
              {plan.features.map((feature, idx) => (
                <ListItem key={idx} dense>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>
          </Box>
          {plan.name == 'Basic' ?  
            <SignInButton mode="modal">
              <Button variant="contained" size="large" fullWidth >Get Started</Button>
            </SignInButton>
            : 
            <Button variant="contained" size="large" fullWidth onClick={handleSubmit}>Get Started</Button>
          }
          {plan.name == 'Pro' ? (
            <Typography
            variant="h6"
            sx={{
              mt: 3,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 0 10px #ff00de, 0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de',
              padding: '10px 20px',
              borderRadius: '10px',
              // background: 'linear-gradient(45deg, #ff00de, #00e1ff)',
              animation: `${glowAnimation} 2s ease-in-out infinite`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            COMING SOON!
          </Typography>
            ) : (<></>) }
        </Paper>
      </Box>
    </Zoom>
  );
};


const AIBotShape = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="2"/>
    <circle cx="8" cy="9" r="2" fill={color}/>
    <circle cx="16" cy="9" r="2" fill={color}/>
    <path d="M7 15h10M12 15v3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FloatingDot = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill={color}/>
  </svg>
);

const InteractiveBackground = ({ darkMode }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const generateElements = () => {
      const newElements = [];
      for (let i = 0; i < 30; i++) {
        const type = Math.random() < 0.33 ? 'falling' : Math.random() < 0.66 ? 'floating' : 'bot';
        newElements.push({
          id: i,
          x: Math.random() * 100,
          y: type === 'falling' ? -10 : Math.random() * 100,
          size: Math.random() * 20 + 10,
          speedX: (Math.random() - 0.5),
          speedY: type === 'falling' ? Math.random() : (Math.random() - 0.5),
          type: type
        });
      }
      setElements(newElements);
    };

    generateElements();
  }, []);

  useEffect(() => {
    const animateElements = () => {
      setElements(prevElements =>
        prevElements.map(el => ({
          ...el,
          x: (el.x + el.speedX + 100) % 100,
          y: el.type === 'falling' 
            ? (el.y + el.speedY > 100 ? -10 : el.y + el.speedY)
            : (el.y + el.speedY + 100) % 100
        }))
      );
    };

    const intervalId = setInterval(animateElements, 50);
    return () => clearInterval(intervalId);
  }, []);

  const color = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(75, 0, 130, 0.1)';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      {elements.map(el => (
        <Box
          key={el.id}
          sx={{
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
        >
          {el.type === 'bot' && <AIBotShape size={el.size} color={color} />}
          {el.type === 'floating' && <FloatingDot size={el.size} color={color} />}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      {elements.map(el => (
        <Box
          key={el.id}
          sx={{
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: el.size,
            height: el.size,
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(75, 0, 130, 0.1)',
            borderRadius: el.type === 'floating' ? '50%' : el.type === 'falling' ? '0' : '25%',
            transform: el.type === 'bot' ? 'rotate(45deg)' : 'none',
          }}
        />
      ))}
    </Box>
  );
};

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const router = useRouter();

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const features = [
    { icon: <UploadFileIcon />, title: 'Interactive Content Conversion', description: 'Upload any YouTube video, PDF, or text file and turn it into an engaging, searchable experience.' },
    { icon: <QuestionAnswerIcon />, title: 'Smart Q&A with Your Files', description: 'Ask questions about uploaded content, and our chatbot responds accurately using AI.' },
    { icon: <ApiIcon />, title: 'Powered by Leading Technologies', description: 'Built with advanced APIs, Pinecone, and Hugging Face for seamless performance.' },
  ];

  // Enhanced use cases data
  const useCases = [
    {
      title: 'For University Students',
      description: 'Enhance your learning experience and boost your academic performance.',
      icon: School,
      benefits: [
        'Quickly search through lecture notes or textbooks to find answers before exams',
        'Generate study guides and summaries from complex course materials'
      ]
    },
    {
      title: 'For Researchers',
      description: 'Accelerate your research process and gain deeper insights from academic literature.',
      icon: Science,
      benefits: [
        'Speed up your research by summarizing and analyzing academic papers',
        'Brainstorm research questions and hypotheses based on existing literature'
      ]
    },
  ];

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for students who need basic text conversion.',
      features: ['Unlimited conversions', 'Basic Q&A support', 'AI-Powered Summary Reader', 'Community access'],
    },
    {
      name: 'Pro',
      price: '$9.99/month',
      description: 'Ideal for power users who need more features.',
      features: ['All Basic Features', 'Advanced AI Q&A', 'Priority support', 'Save Features', 'AI Voice Conversations', 'Content Organization'],
    },
  ];


  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#9C27B0' : '#E6E6FA',
          },
          background: {
            default: darkMode ? '#121212' : '#FFFFFF',
            paper: darkMode ? '#1E1E1E' : '#F8F8FF',
          },
          text: {
            primary: darkMode ? '#FFFFFF' : '#4B0082',
          },
          icons: {
            main: darkMode ? '#9C27B0' : '#E6E6FA',
            color: darkMode ? '#9C27B0' : '#E6E6FA',
          }
        },
        typography: {
          fontFamily: "'Playfair Display', serif",
          h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
          },
          h2: {
            fontWeight: 600,
            fontSize: '2rem',
          },
          body1: {
            fontFamily: "'Roboto', sans-serif",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 30,
                textTransform: 'none',
                fontWeight: 600,
                padding: '10px 20px',
              },
              contained: {
                backgroundColor: darkMode ? '#9C27B0' : '#E6E6FA',
                color: darkMode ? '#FFFFFF' : '#4B0082',
                '&:hover': {
                  backgroundColor: darkMode ? '#7B1FA2' : '#D8BFD8',
                },
              },
              outlined: {
                borderColor: darkMode ? '#9C27B0' : '#E6E6FA',
                color: darkMode ? '#FFFFFF' : '#4B0082',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(156, 39, 176, 0.04)' : 'rgba(230, 230, 250, 0.1)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    handleMenuClose();
  };

  const ResponsiveAppBar = ({ darkMode, toggleTheme, scrollToSection }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const handleMenuItemClick = (section) => {
      scrollToSection(section);
      handleClose();
    };
  
    return (
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>  
          {isMobile ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => handleMenuItemClick('features')}>Features</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('how-it-works')}>How It Works</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('pricing')}>Pricing</MenuItem>
              </Menu>

              
                <img 
                  src='/logo.png'
                  alt="Logo"
                  style={{
                    marginTop: 0,
                    borderRadius: '10px',
                    height: '40px',
                    width: 'auto'
                  }}
                />
                <Typography variant="h6" sx={{ ml: 2, fontWeight: 700, display: { sm: 'block' } }}>
                  AiQuickDoc
                </Typography>
              </Box>
            </Box>
          ) : ( 
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src='/logo.png'
              alt="Logo"
              style={{
                marginTop: 0,
                borderRadius: '10px',
                height: '40px',
                width: 'auto'
              }}
            />
            <Typography variant="h6" sx={{ ml: 2, fontWeight: 700, display: { sm: 'block' } }}>
              AiQuickDoc
            </Typography>
          </Box>
           
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button color="inherit" onClick={() => scrollToSection('features')}>Features</Button>
              <Button color="inherit" onClick={() => scrollToSection('how-it-works')}>How It Works</Button>
              <Button color="inherit" onClick={() => scrollToSection('pricing')}>Pricing</Button>
            </Box>
            </Box>
          )} 
            
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outlined" size="small">Login</Button>
              </SignInButton>
            </SignedOut>
          </Box>
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InteractiveBackground darkMode={darkMode} />
        <SignedIn>
          <AppBar position="fixed" color="inherit" elevation={0}>
            <Toolbar pl={2}>
              <img 
                src='/logo.png'
                style={{ 
                  mt: 0,
                  borderRadius: '10px'}}/>
                <Typography variant="h6" sx={{ ml: 2, flexGrow: 1, fontWeight: 700 }}>
                  AiQuickDoc
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton color="inherit" onClick={toggleTheme}>
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
            
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                  
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="outlined">Login</Button>
                      </SignInButton>
                  </SignedOut>
                </Box>
              </Toolbar>
            </AppBar>
        
            <FileUploadSummarize />
      </SignedIn>

      <SignedOut>

        <ResponsiveAppBar 
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          scrollToSection={scrollToSection}
        />
        

      {/* Hero section */}
      <Box sx={{ pt: 10, pb: 10, mt: 5, mb: 10 }}>
        <Container maxWidth="md">
          <Grow in={true} timeout={1000}>
            <Typography variant="h1" align="center" gutterBottom sx={{ mb: 2, color: '#9C27B0' }}>
             AiQuickDoc
            </Typography>
          </Grow>
          <Grow in={true} timeout={1500}>
            <Typography variant="h5" align="center" paragraph sx={{ mb: 2}}>
              <span style={{ color: '#9C27B0' }}>Insights</span> from Your Files in Seconds <span style={{ color: '#9C27B0' }}>with AiQuickDoc!</span> 
            </Typography>  
          </Grow>
          <Grow in={true} timeout={2000}>
            <Typography variant="h6" align="center" paragraph sx={{ mb: 4 }}>
              AiQuickDoc offers streamlined summaries, simplified PDFs and files, interactive chat for better understanding, and flashcards to boost your learning experience.
            </Typography>
          </Grow>
          <VideoSectionOne />

          <Grow in={true} timeout={2000}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <SignInButton mode="modal">
                <Button variant="contained" size="large" >Get Started</Button>
              </SignInButton>
              <Button variant="outlined" size="large" onClick={() => scrollToSection('features')}>
                Explore Features
              </Button>
            </Box>
          </Grow>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        {/* Features section */}
        <Box id="features" sx={{ mb: 20 }}>
          <Grow in={true} timeout={1000}>
            <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>
              Features
            </Typography>
          </Grow>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeatureCard feature={feature} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>

          {/* How It Works section */}
          <Box id="how-it-works" sx={{ mt: 10, mb: 10 }}>
            <Grow in={true} timeout={1000}>
              <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>
              Use Cases & How It Works
              </Typography>
            </Grow>
                  <Grid container spacing={5}>
                      <Grid item xs={12} md={4}>
                        <Zoom in={true} style={{ transitionDelay: `500ms` }}>
                          <Box 
                            sx={{ 
                              textAlign: 'center',
                              transition: 'all 0.3s ease-in-out',
                            }}
                          >
                            <Box sx={{ 
                              fontSize: 64, 
                              mb: 1, 
                              color: 'theme.palette.icons',
                              transition: 'transform 0.5s ease-in-out'
                            }}>
                              <UploadIcon  />
                            </Box>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Upload Content</Typography>
                            <Typography variant="body1">Drag and drop your .pdf or .txt files or paste in anything you like.</Typography>
                            <VideoSectionTwo />
                          </Box>
                        </Zoom>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Zoom in={true} style={{ transitionDelay: `500ms` }}>
                          <Box 
                            sx={{ 
                              textAlign: 'center',
                              transition: 'all 0.3s ease-in-out',
                            }}
                          >
                            <Box sx={{ 
                              fontSize: 64, 
                              mb: 1, 
                              color: 'theme.palette.icons',
                              transition: 'transform 0.5s ease-in-out'
                            }}>
                              <ChatIcon />
                            </Box>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Ask Your Questions</Typography>
                            <Typography variant="body1">Type any question about your content, and get AI-powered answers.</Typography>
                            <VideoSectionThree />
                          </Box>
                        </Zoom>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Zoom in={true} style={{ transitionDelay: `500ms` }}>
                          <Box 
                            sx={{ 
                              textAlign: 'center',
                              transition: 'all 0.3s ease-in-out',
                            }}
                          >
                            <Box sx={{ 
                              fontSize: 64, 
                              mb: 1, 
                              color: 'theme.palette.icons',
                              transition: 'transform 0.5s ease-in-out'
                            }}>
                              <DoneIcon />
                            </Box>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Get Instant Responses</Typography>
                            <Typography variant="body1">Receive accurate, concise responses tailored to your content.</Typography>
                            <VideoSectionFour />
                          </Box>
                        </Zoom>
                      </Grid>
                    </Grid>
                  </Box>

        {/* Use Cases section */}
        <Box id="use-cases" sx={{ mb: 20 }}>
          <Grow in={true} timeout={1000}>
            <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>
              
            </Typography>
          </Grow>
          <Grid container spacing={4}>
            {useCases.map((useCase, index) => (
              <Grid item xs={12} md={6} key={index}>
                <UseCaseCard useCase={useCase} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Pricing section */}
        <Box id="pricing" sx={{ mb: 8 }}>
          <Grow in={true} timeout={1000}>
            <Typography variant="h2" align="center" gutterBottom sx={{ mb: 6 }}>
              Ready to become the BEST!
            </Typography>
          </Grow>
          <Grid container spacing={3} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <PricingCard plan={plan} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>



        {/* Contact us section */}
        <ContactSection/>
      </Container>
      

      {/* Footer */}
      <Box component="footer" 
        sx={{
          py: 4,
          px: 2,
          mt: 'auto',
          bgcolor: 'background.paper',
        }}>
        <Container maxWidth="lg">
          <Typography variant="body1" align="center">
            © 2024 AIQuickDoc. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
           Crafted with ❤️ by Edom Belayneh, Helena Tesfaye, Manizha Khorram, Mino Ralison.
          </Typography>
        </Container>
      </Box>
      </SignedOut>
    </ThemeProvider>
  );
};

export default Home;
