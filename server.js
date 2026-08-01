require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const visitRoutes = require('./routes/visits');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json());

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- Serve the frontend (plain HTML/CSS/JS) ---
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Any non-API route falls back to index.html (login page)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Salesman CRM server running on port ${PORT}`);
});
