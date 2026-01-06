const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const bookRoutes = require('./routes/books');
const issueRoutes = require('./routes/issues');
const invoiceRoutes = require('./routes/invoices');

// Import database connection
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from renderer
app.use(express.static(path.join(__dirname, '../renderer')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/invoices', invoiceRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../renderer/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../renderer/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../renderer/register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../renderer/dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});