const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const  Cliente  = require('../models/Clientes'); // Asumiendo que tienes un modelo llamado Cliente

// Ruta de registro
router.post('/register', [
  check('numDocumento').notEmpty().withMessage('El número de documento es requerido'),
  check('nombres').notEmpty().withMessage('El nombre es requerido'),
  check('email').notEmpty().withMessage('El correo electrónico es requerido').isEmail().withMessage('El correo electrónico no es válido'),
  check('telefono').notEmpty().withMessage('El número de teléfono es requerido'),
  check('password').notEmpty().withMessage('La contraseña es requerida').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  check('passwordConfirmation').notEmpty().withMessage('La confirmación de contraseña es requerida').custom((value, { req }) => value === req.body.password).withMessage('La confirmación de contraseña no coincide'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { numDocumento, nombres, email, telefono, password } = req.body;

    // Verificar si el cliente ya está registrado
   const existingCliente = await Cliente.findOne( { email } );
   if (existingCliente) {
     return res.status(400).json({ error: 'El cliente ya está registrado' });
   }

    // Crear una instancia del cliente
    const clienteData = {
        numDocumento,
        nombres,
        email,
        telefono,
        password: await bcrypt.hash(password, 10),
        estado: 'ACTIVO',
        tipo: 'CLIENTE',
        creacion: new Date().toISOString(),
      };
      const clienteId = await Cliente.create(clienteData);

    return res.status(200).json({ success: 'Registrado exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el registro' });
  }
});

module.exports = router;



