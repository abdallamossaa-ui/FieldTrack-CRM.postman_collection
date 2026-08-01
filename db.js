// Very simple file-based database.
// It stores everything in backend/data/db.json as plain JSON.
// This avoids needing to install/configure a real database server -
// perfect for a small team's customer tracker.

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function ensureDbFile() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [],
      customers: [],
      visits: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb };
