require('dotenv').config({ path: '.env.local' }); // Load env vars
const { query } = require('../lib/db');

async function run() {
    try {
        console.log("Attempting to add 'target' column to cms_menus...");
        await query("ALTER TABLE cms_menus ADD COLUMN target VARCHAR(20) DEFAULT '_self'");
        console.log("Column 'target' added successfully.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'target' already exists.");
        } else {
            console.error("Error adding column:", e);
        }
    }
    process.exit(0);
}

run();
