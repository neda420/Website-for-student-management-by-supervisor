
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkTasks() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query("SELECT id, title, status, priority FROM tasks");
        console.log("All Tasks:", rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
checkTasks();
