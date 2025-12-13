const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err);
    process.exit(1);
  }
});

db.all("PRAGMA table_info(users)", (err, rows) => {
  if (err) {
    console.error('Error getting table info:', err);
    process.exit(1);
  }
  
  const tokenCol = rows.find(r => r.name === 'token');
  if (tokenCol) {
    console.log('Token column EXISTS.');
  } else {
    console.log('Token column MISSING.');
    // Try to add it
    db.run("ALTER TABLE users ADD COLUMN token TEXT", (err) => {
      if (err) console.error('Failed to add token column:', err);
      else console.log('Token column ADDED successfully.');
    });
  }
});
