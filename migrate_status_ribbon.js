const { db } = require('./db');

const seedStatus = async () => {
    // 1. Add Category
    const categorySlug = 'status-ribbon';
    const categoryLabel = 'Status (Ribbon)';
    const now = new Date().toISOString();

    console.log('Adding Status (Ribbon) category...');

    db.get('SELECT id FROM trip_fact_categories WHERE slug = ?', [categorySlug], (err, row) => {
        if (err) {
            console.error('Error checking category:', err);
            return;
        }

        if (!row) {
            // Check if isDefault column exists to avoid error, though looking at codebase it seems it was added in migrate_category_defaults.js
            // But lets just try insert.
             db.run(
                'INSERT INTO trip_fact_categories (label, slug, isDefault, createdAt, updatedAt) VALUES (?, ?, 1, ?, ?)',
                [categoryLabel, categorySlug, now, now],
                function(err) {
                    if (err) {
                        console.error('Error inserting category:', err);
                        // If error is about isDefault, try without it
                         db.run(
                            'INSERT INTO trip_fact_categories (label, slug, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
                            [categoryLabel, categorySlug, now, now],
                            function(err2) {
                                if (err2) console.error('Error inserting category (retry):', err2);
                                else seedAttributes();
                            }
                        );
                        return;
                    }
                    console.log(`Category ${categoryLabel} added.`);
                    seedAttributes();
                }
            );
        } else {
            console.log('Category already exists.');
            seedAttributes();
        }
    });

    function seedAttributes() {
        const attributes = ['New', 'Bestseller', 'Popular', 'Sale', 'Trending'];
        const stmt = db.prepare('INSERT INTO package_attributes (name, type, createdAt, updatedAt) VALUES (?, ?, ?, ?)');
        
        db.serialize(() => {
             // We can blindly insert, or check first. Since we are developing, blindly inserting might duplicate if run twice.
             // But since this is a one-off "step", it's okay.
             // Actually, let's check duplicates to be safe.
            let completed = 0;
            attributes.forEach(attr => {
                db.get('SELECT id FROM package_attributes WHERE name = ? AND type = ?', [attr, categorySlug], (err, row) => {
                    if (!row) {
                        stmt.run(attr, categorySlug, now, now);
                        console.log(`Added attribute: ${attr}`);
                    }
                    completed++;
                    if (completed === attributes.length) {
                        stmt.finalize(() => {
                            console.log('Attributes seeding complete.');
                            db.close();
                        });
                    }
                });
            });
        });
    }
};

seedStatus();
