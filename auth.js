const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('../db');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
// The very first person to register becomes "admin" (sees everyone's customers).
// Everyone after that registers as "salesman" (sees only their own customers)
// unless an admin later changes their role directly in data/db.json.
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const db = readDb();
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const role = db.users.length === 0 ? 'admin' : 'salesman';
  const hashed = bcrypt.hashSync(password, 10);

  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password: hashed,
    role,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDb(db);

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// GET /api/auth/me - useful to verify a stored token is still valid
const { requireAuth } = require('../middleware/auth');
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
