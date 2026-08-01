const express = require('express');
const { readDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/dashboard - recent visits feed, scoped by role
router.get('/', (req, res) => {
  const db = readDb();

  let visits = db.visits;
  if (req.user.role !== 'admin') {
    visits = visits.filter(v => v.salesmanId === req.user.id);
  }

  const feed = visits
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50)
    .map(v => {
      const customer = db.customers.find(c => c.id === v.customerId);
      const salesman = db.users.find(u => u.id === v.salesmanId);
      return {
        id: v.id,
        customerId: v.customerId,
        customerName: customer ? customer.name : 'Unknown customer',
        salesmanName: salesman ? salesman.name : 'Unknown salesman',
        status: v.status,
        notes: v.notes,
        createdAt: v.createdAt
      };
    });

  const scopedCustomers = req.user.role === 'admin'
    ? db.customers
    : db.customers.filter(c => c.assignedTo === req.user.id);

  res.json({
    totalCustomers: scopedCustomers.length,
    totalVisits: visits.length,
    recentVisits: feed
  });
});

module.exports = router;
