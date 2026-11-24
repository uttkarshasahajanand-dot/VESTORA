



const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 15000
});

async function testDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    console.log("================================");
    console.log("VESTORA CLOUD MYSQL CONNECTED");
    console.log("Database:", process.env.DB_NAME);
    console.log("================================");

    return true;
  } catch (error) {
    console.error("MYSQL CONNECTION FAILED:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  pool,
  testDatabaseConnection
};
