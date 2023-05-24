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
//const loginRouter = require("./routes/login")
const listadoRegistro = require("./routes/listadoRegistro")
const registroCliente = require("./routes/registroCliente")
const localidadRouter = require("./routes/localidad")


app.use(express.json())
app.use(cors())

// Agrega el middleware de sesión
//app.use(session({
//  secret: 'mySecretKey', // Cambia esto por una clave secreta más segura
//  resave: false,
//  saveUninitialized: false
//}));

app.use("/api/test",testRouter)
app.use("/api/register",registerRouter)
//app.use("/api/login", loginRouter)
app.use("/api/auth",authRouter)
app.use("/api/listado-Registro", listadoRegistro)
app.use("/api/registro-cliente", registroCliente)
app.use("/api/localidad", localidadRouter)


dbConnection.connect((error) => {
    if (error) {
      console.error('Error connecting to database: ', error);
    } else {
      console.log('Successful connection to the database.');
      app.listen(port, () => {
        console.log("API Server of tennis running");
      });
    }
  });