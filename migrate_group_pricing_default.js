const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'users.db');
const db = new sqlite3.Database(dbPath);

const runMigration = () => {
  console.log('Running migration: Add isDefault to package_group_pricing');
  
  db.serialize(() => {
    db.run(`ALTER TABLE package_group_pricing ADD COLUMN isDefault INTEGER DEFAULT 0`, (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log('Column isDefault already exists.');
        } else {
          console.error('Error adding column:', err);
        }
      } else {
        console.log('Successfully added isDefault column to package_group_pricing table.');
      }
    });
  });

  db.close();
};

runMigration();
