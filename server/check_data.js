
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkData() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [students] = await pool.query("SELECT status, COUNT(*) as c FROM students GROUP BY status");
        console.log("Students by Status:", students);

        const [tasks] = await pool.query("SELECT status, priority, COUNT(*) as c FROM tasks GROUP BY status, priority");
        console.log("Tasks by Status/Priority:", tasks);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
checkData();
