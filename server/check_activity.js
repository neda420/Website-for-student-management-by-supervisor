
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkActivityTable() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query("SHOW TABLES LIKE 'activity_logs'");
        console.log("Activity Table Exists:", rows.length > 0);
        if (rows.length > 0) {
            const [count] = await pool.query("SELECT COUNT(*) as c FROM activity_logs");
            console.log("Activity Count:", count[0].c);
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
checkActivityTable();
