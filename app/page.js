'use client'
import { Box, Button, Stack, TextField, Typography, Grid,AppBar,Toolbar } from '@mui/material'
import { useState } from 'react'
import SendIcon from '@mui/icons-material/Send';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  
  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
    setMessage('')

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

  const [message, setMessage] = useState('')

  return (
    <>
    
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#121212"  // Black background
        p={3}
      >
        <Grid container spacing={3} justifyContent="center">
        <AppBar position="static" sx={{ bgcolor: 'transparent', background: 'linear-gradient(to right, #1e88e5, #00bcd4)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>
            Professor Review Hub
          </Typography>
          <Button color="inherit" sx={{ color: '#fff' }}>Log In</Button>
          <Button color="inherit" sx={{ color: '#fff' }}>Sign Up</Button>
        </Toolbar>
      </AppBar>
          <Grid item
          display="flex"justifyContent="center" alignItems="center">
            <Stack
              direction={'column'}
              width="450px"
              height="700px"
              bgcolor="#1c1c1c"  // Dark grey for chat box background
              border="1px solid"
              borderColor="#333"  // Slightly lighter grey border
              borderRadius={4}
              boxShadow={3}
              p={3}
              spacing={3}
            >
              <Typography variant="h5" align="center" color="#00bcd4">  {/* Blue text color */}
                Rate My Professor Assistant
              </Typography>
              <Stack
                direction={'column'}
                spacing={2}
                flexGrow={1}
                overflow="auto"
                maxHeight="100%"
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={
                      message.role === 'assistant' ? 'flex-start' : 'flex-end'
                    }
                  >
                    <Box
                      bgcolor={
                        message.role === 'assistant'
                          ? '#1e88e5'  // Blue for assistant messages
                          : '#757575'  // Grey for user messages
                      }
                      color="white"
                      borderRadius={16}
                      p={2}
                      maxWidth="1000%"
                      minHeight="60px"  // Increased minimum height for chat bubbles
                      display="flex"
                      alignItems="center"
                    >
                      {message.content}
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <TextField
                  label="Type your message"
                  variant="outlined"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  InputLabelProps={{
                    style: { color: '#bdbdbd' },  // Grey text color for label
                  }}
                  InputProps={{
                    style: { color: 'white', backgroundColor: '#333' },  // Darker grey for input box
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={sendMessage}
                  sx={{ bgcolor: '#1e88e5', '&:hover': { bgcolor: '#1565c0' } }}  // Blue button with darker hover effect
                >
                  Send
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item>
            <Box
              width="450px"
              height="700px"
              bgcolor="#1c1c1c"  // Dark grey for description box background
              border="1px solid"
              borderColor="#333"  // Slightly lighter grey border
              borderRadius={4}
              boxShadow={3}
              p={3}
            >
              <Typography variant="h4" color="#00bcd4">
                Why Professor Review Hub
              </Typography>
              <Typography variant="body1" mt={2} color="#e0e0e0">  {/* Light grey text */}
                This chat assistant is designed to help you with any questions or issues you may have regarding the Rate My Professor platform. Simply type your query in the chat box on the left, and our assistant will guide you with relevant information.
              </Typography>
              <Typography variant="body2" mt={2} color="#bdbdbd">  {/* Slightly darker grey text */}
                You can ask about professor ratings, how to submit your own rating, and more. Our assistant is here to make your experience with the platform smoother and more informative.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
