import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Box, Paper, Typography } from '@mui/material';

const ChatBot = ({ uploadSessionId }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey there! Ask me any question on your file!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { text: input, role: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatImp', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input, sessionId: uploadSessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      console.log(data)
      setMessages(prev => [...prev, { text: data.message, role: 'assistant' }]);
    } catch (error) {
      console.error('Error:', error);
      console.log(error)
      setMessages(prev => [...prev, { text: 'Sorry, an error occurred.', role: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {messages.map((msg, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
          mb={2}
        >
          <Paper
            style={{
              padding: '10px',
              maxWidth: '60%',
              backgroundColor: msg.role === 'assistant' ? '#f0f0f0' : '#e0ffe0',
            }}
          >
            <Typography variant="body1">
              {msg.role === 'assistant' ? 'Assistant: ' : 'You: '}{msg.text}
            </Typography>
          </Paper>
        </Box>
      ))}
      <div ref={messagesEndRef} />
      <Box display="flex" mt={2}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBot;
