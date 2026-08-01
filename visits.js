const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function canAccess(user, customer) {
  return user.role === 'admin' || customer.assignedTo === user.id;
}

// POST /api/visits - log a new visit for a customer
router.post('/', (req, res) => {
  const { customerId, notes, status } = req.body;
  if (!customerId || !status) {
    return res.status(400).json({ error: 'customerId and status are required.' });
  }

  const db = readDb();
  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: 'Customer not found.' });
  if (!canAccess(req.user, customer)) {
    return res.status(403).json({ error: 'You do not have access to this customer.' });
  }

  const visit = {
    id: uuidv4(),
    customerId,
    salesmanId: req.user.id,
    notes: notes || '',
    status,
    createdAt: new Date().toISOString()
  };

  db.visits.push(visit);

  // update the customer's summary fields
  customer.lastVisit = visit.createdAt;
  customer.latestStatus = status;

  writeDb(db);
  res.status(201).json(visit);
});

// GET /api/visits/customer/:customerId - visit history for one customer
router.get('/customer/:customerId', (req, res) => {
  const db = readDb();
  const customer = db.customers.find(c => c.id === req.params.customerId);
  if (!customer) return res.status(404).json({ error: 'Customer not found.' });
  if (!canAccess(req.user, customer)) {
    return res.status(403).json({ error: 'You do not have access to this customer.' });
  }

  const visits = db.visits
    .filter(v => v.customerId === req.params.customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(visits);
});

module.exports = router;
