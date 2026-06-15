const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Your routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/blogs', require('../routes/blogs'));
app.use('/api/users', require('../routes/users'));

// Connect to MongoDB
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = conn;
  return conn;
}

// Vercel serverless handler
module.exports = async (req, res) => {
  await connectToDatabase();
  app(req, res);
};