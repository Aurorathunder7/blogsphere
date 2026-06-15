const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connection for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = conn;
  return conn;
}

// Vercel serverless handler
module.exports = async (req, res) => {
  await connectToDatabase();
  app(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectToDatabase().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}