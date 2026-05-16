const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dsa-tracker';
mongoose.connect(uri)
  .then(() => console.log('MongoDB connection established successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
const questionsRouter = require('./routes/questions');
app.use('/api/questions', questionsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
