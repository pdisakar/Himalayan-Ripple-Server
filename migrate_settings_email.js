const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'users.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const migrate = async () => {
    const columns = [
        { name: 'email', type: 'TEXT' },
        { name: 'contactPerson1Email', type: 'TEXT' },
        { name: 'contactPerson2Email', type: 'TEXT' }
    ];

    for (const col of columns) {
        try {
            await run(`ALTER TABLE settings ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added column ${col.name}`);
        } catch (err) {
            if (err.message.includes('duplicate column name')) {
                console.log(`Column ${col.name} already exists`);
            } else {
                console.error(`Error adding column ${col.name}:`, err);
            }
        }
    }
    console.log('Migration complete');
    db.close();
};

migrate();
