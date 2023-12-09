const mysql = require('mysql2/promise');
require("dotenv").config({ path: "/etc/secrets/tenis" })
console.log(process.env.HOST)
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  //port: process.env.DB_PORT,
});

const dbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    throw new Error('Error connecting to the database: ' + error.message);
  }
};

module.exports = dbConnection;
