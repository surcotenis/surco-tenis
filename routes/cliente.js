const express = require('express');
const router = express.Router();
const db = require('../core/db_config'); // Importa el módulo para acceder a la base de datos
const moment = require('moment');
const {verifyToken, verifyTokenAndAuthorization} =require("./verifyToken")

router.get('/perfil/:codCliente',verifyTokenAndAuthorization, (req, res) => {
    
    const codCliente = req.params.codCliente;
    const sql = 'SELECT * FROM cliente WHERE codCliente = ?';
  
    db.query(sql, [codCliente], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: 'Perfil de usuario no encontrado' });
        } else {
          const perfilUsuario = results[0];
          res.json(perfilUsuario);
        }
      }
    });
  });
  
  module.exports = router;
