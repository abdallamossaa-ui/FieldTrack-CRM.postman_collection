const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Turns a raw address typed by the user into a clickable Google Maps search link.
function addressToMapsUrl(address) {
  const encoded = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function canAccess(user, customer) {
  return user.role === 'admin' || customer.assignedTo === user.id;
}

// GET /api/customers - list customers visible to the logged-in user
router.get('/', (req, res) => {
  const db = readDb();
  const list = db.customers.filter(c => req.user.role === 'admin' || c.assignedTo === req.user.id);

  // attach salesman name for display
  const withNames = list.map(c => {
    const owner = db.users.find(u => u.id === c.assignedTo);
    return { ...c, assignedToName: owner ? owner.name : 'Unknown' };
  });

  withNames.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(withNames);
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  const db = readDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found.' });
  if (!canAccess(req.user, customer)) {
    return res.status(403).json({ error: 'You do not have access to this customer.' });
  }
  const owner = db.users.find(u => u.id === customer.assignedTo);
  res.json({ ...customer, assignedToName: owner ? owner.name : 'Unknown' });
});

// POST /api/customers - create a new customer
router.post('/', (req, res) => {
  const { name, phone, address, notes } = req.body;
  if (!name || !address) {
    return res.status(400).json({ error: 'Customer name and address/location are required.' });
  }

  const db = readDb();
  const customer = {
    id: uuidv4(),
    name,
    phone: phone || '',
    address,
    location: addressToMapsUrl(address), // clickable Google Maps link
    notes: notes || '',
    assignedTo: req.user.id, // owned by the salesman who created it
    lastVisit: null,
    latestStatus: 'New',
    createdAt: new Date().toISOString()
  };

  db.customers.push(customer);
  writeDb(db);
  res.status(201).json(customer);
});

// PUT /api/customers/:id - edit a customer
router.put('/:id', (req, res) => {
  const db = readDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found.' });
  if (!canAccess(req.user, customer)) {
    return res.status(403).json({ error: 'You do not have access to this customer.' });
  }

  const { name, phone, address, notes } = req.body;
  if (name) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (address) {
    customer.address = address;
    customer.location = addressToMapsUrl(address);
  }
  if (notes !== undefined) customer.notes = notes;

  writeDb(db);
  res.json(customer);
});

// DELETE /api/customers/:id
router.delete('/:id', (req, res) => {
  const db = readDb();
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found.' });
  if (!canAccess(req.user, customer)) {
    return res.status(403).json({ error: 'You do not have access to this customer.' });
  }

  db.customers = db.customers.filter(c => c.id !== req.params.id);
  db.visits = db.visits.filter(v => v.customerId !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

module.exports = router;
