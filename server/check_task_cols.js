
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkCols() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM tasks");
        console.log("Cols:", rows.map(r => r.Field));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
checkCols();
