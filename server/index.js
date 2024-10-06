const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));

// Home route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Set the server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
