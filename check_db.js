
import pool from './server/config/database.js';

async function checkDb() {
    try {
        console.log("Checking database...");

        // Check tasks table
        const [tasksTable] = await pool.query("SHOW TABLES LIKE 'tasks'");
        if (tasksTable.length === 0) {
            console.error("❌ 'tasks' table matches no table in DB!");
        } else {
            console.log("✅ 'tasks' table exists.");
            const [columns] = await pool.query("SHOW COLUMNS FROM tasks");
            console.log("Tasks columns:", columns.map(c => c.Field).join(', '));
        }

        // Check documents table
        const [docsTable] = await pool.query("SHOW TABLES LIKE 'documents'");
        if (docsTable.length === 0) {
            console.error("❌ 'documents' table matches no table in DB!");
        } else {
            console.log("✅ 'documents' table exists.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Global error:", err);
        process.exit(1);
    }
}

checkDb();
