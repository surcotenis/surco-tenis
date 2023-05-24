const express = require('express');
const router = express.Router();
const db = require('../core/db_config'); // Importa el módulo para acceder a la base de datos
const moment = require('moment');

router.get('/listar/', (req, res) => {
  const id = req.query.id;
  const sql = `
    SELECT * FROM localidad`;

  db.query(sql, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(rows); // Enviar las filas obtenidas en la respuesta JSON
    }
  });
});
module.exports = router;