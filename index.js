require("dotenv").config()
const express = require("express")
const session = require('express-session')
const app = express()
const cors = require("cors")
const port = process.env.PORT||5000
const dbConnection = require('./core/db_config');
const testRouter = require("./routes/test")
const registerRouter = require("./routes/register")
const authRouter = require("./routes/auth")
const listadoRegistro = require("./routes/listadoRegistro")
const registroCliente = require("./routes/registroCliente")
const localidadRouter = require("./routes/localidad")
const clienteRouter = require("./routes/cliente")

app.use(express.json())
app.use(cors())

app.use("/api/test",testRouter)
app.use("/api/register",registerRouter)
app.use("/api/auth",authRouter)
app.use("/api/listado-Registro", listadoRegistro)
app.use("/api/registro-cliente", registroCliente)
app.use("/api/localidad", localidadRouter)
app.use("/api/cliente",clienteRouter)

dbConnection.connect((error) => {
   // if (error) {
   //   console.error('Error connecting to database: ', error);
   // } else {
      //console.log('Successful connection to the database.');
      app.listen(port, () => {
        console.log("API Server of tennis running");
      });
   // }
  });