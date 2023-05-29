const mysql = require('mysql')

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
  AVNS_ORI7Nl0JV9g_ubApkbk
  });

  module.exports = connection