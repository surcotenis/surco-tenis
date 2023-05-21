const connection = require('../core/db_config'); // Archivo de configuración de la base de datos

const Cliente = {
    create: async (clienteData) => {
        return new Promise((resolve, reject) => {
          const query = 'INSERT INTO cliente SET ?';
          connection.query(query, clienteData, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.insertId);
            }
          });
        });
      },
  // Otros métodos del modelo Cliente, como findAll, findById, update, delete, etc.

    // ...otros métodos del modelo Cliente...
  
    findOne: async (conditions) => {
        return new Promise((resolve, reject) => {
          const query = 'SELECT * FROM cliente WHERE ?';
          connection.query(query, conditions, (error, results) => {
            if (error) {
              reject(error);
            } else {
              if (results.length > 0) {
                resolve(results[0]);
              } else {
                resolve(null);
              }
            }
          });
        });
      },
  };

module.exports = Cliente;
