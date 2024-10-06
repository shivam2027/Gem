const express = require('express');
const Chat = require('../models/Chat'); // Import the Chat model
const runChat = require('.../src/config/gemini'); // Adjust the import based on your project structure
const router = express.Router();

// Endpoint for sending messages
router.post('/chat', async (req, res) => {
  const { userId, userMessage } = req.body;

  try {
    // Send message to Google Generative AI API
    const aiResponse = await runChat(userMessage); // Call the provided runChat function

    // Create a new chat log entry
    const newChatLog = new Chat({
      userId,
      messages: [{ userMessage, aiResponse }],
    });

    // Save the chat log to the database
    await newChatLog.save();

    // Send response back to the client
    res.json({ userMessage, aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Endpoint to get chat history for a user
router.get('/chat/history/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const chatHistory = await Chat.find({ userId }).sort({ timestamp: -1 }); // Sort by most recent first
  
      if (!chatHistory.length) {
        return res.status(404).json({ message: 'No chat history found' });
      }
  
      res.json(chatHistory);
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
  });
  

module.exports = router;
