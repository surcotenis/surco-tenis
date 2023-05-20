const mysql = require('mysql')


const connection = mysql.createConnection({
    host: 'xxx',
    user: 'xxx',
    password: 'xxx',
    database: 'xxx',
  });

  module.exports = connection