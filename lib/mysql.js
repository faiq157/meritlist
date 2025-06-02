import mysql from "mysql2/promise";

let pool;

export function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "your_db_name",
      waitForConnections: true,
      connectionLimit: 10, // adjust as needed
      queueLimit: 0,
    });
  }
  return pool;
}