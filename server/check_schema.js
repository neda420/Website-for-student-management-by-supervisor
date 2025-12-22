
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM students");
        console.log("Students Columns:", rows.map(r => r.Field).join(', '));

        const [rows2] = await pool.query("SELECT DISTINCT status FROM students");
        console.log("Distinct Statuses:", rows2);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
checkSchema();
