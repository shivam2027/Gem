const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
// app.use(cors());
app.use(cors({ origin: 'https://newgemini.netlify.app/' }));
app.use(express.json()); // Body parser

// Configure multer
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    // Here you can process the file, e.g., save it to a database or cloud storage
    console.log('Uploaded file:', req.file);
    res.send('File uploaded successfully.');
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));  

// Home route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Set the server port
const PORT = process.env.PORT || 5137;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
