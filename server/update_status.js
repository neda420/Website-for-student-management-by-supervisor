
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function updateStatus() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await pool.query("UPDATE students SET status = 'Active'");
        console.log("Updated all students to Active");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
updateStatus();
