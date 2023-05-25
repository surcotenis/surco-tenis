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

  router.put('/perfil/:codCliente', verifyTokenAndAuthorization, (req, res) => {
    const codCliente = req.params.codCliente;
    const updatedFields = req.body;
    
    // Verificar si el perfil de usuario existe antes de realizar la actualización
    const checkProfileQuery = 'SELECT * FROM cliente WHERE codCliente = ?';
    db.query(checkProfileQuery, [codCliente], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Perfil de usuario no encontrado' });
      }
      
      // Construir la consulta de actualización y los valores dinámicamente
      let updateProfileQuery = 'UPDATE cliente SET ';
      const updateValues = [];
      
      for (const key in updatedFields) {
        updateProfileQuery += `${key} = ?, `;
        updateValues.push(updatedFields[key]);
      }
      
      updateProfileQuery = updateProfileQuery.slice(0, -2); // Eliminar la última coma y espacio
      
      updateProfileQuery += ' WHERE codCliente = ?';
      updateValues.push(codCliente);
      
      // Realizar la actualización del perfil de usuario
      db.query(updateProfileQuery, updateValues, (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        // Si la actualización se realiza correctamente, puedes enviar una respuesta exitosa
        return res.json({ message: 'Perfil de usuario actualizado correctamente' });
      });
    });
  });
  
  
  
  module.exports = router;
