const express = require('express');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const  Cliente  = require('../models/Clientes');


router.post("/", async  (req,res)=>{


   

  try {

    const { email } = req.body;

    if( email == "" ){
        return res.status(400).json({ error: 'email required' });
    }  

    const existingCliente = await Cliente.findOne( { email } );

    if (!existingCliente) {
        return res.status(400).json({ error: 'El cliente no está registrado' });
      }
      console.log(existingCliente);

  } catch (error) {
    
  }
}

   
);
  
  module.exports = router;