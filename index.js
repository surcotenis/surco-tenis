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
const { createFormToken } = require('./createPayment')
const hmacSHA256 = require('crypto-js/hmac-sha256')
const Hex = require('crypto-js/enc-hex')

app.use(express.json())
app.use(cors())

app.use("/api/test",testRouter)
app.use("/api/register",registerRouter)
app.use("/api/auth",authRouter)
app.use("/api/listado-Registro", listadoRegistro)
app.use("/api/registro-cliente", registroCliente)
app.use("/api/localidad", localidadRouter)
app.use("/api/cliente",clienteRouter)


app.post('/createPayment', async (req, res) => {
  const paymentConf = req.body.paymentConf

  try {
    const formToken = await createFormToken(paymentConf)
    res.send(formToken)
  } catch (error) {
    console.log({error})
    res.status(500).send(error)
  }
})

app.post('/validatePayment', (req, res) => {
let hmac
  if(process.env.MODE === "TEST") {
    hmac = process.env.IZIPAY_HMAC_TEST;
  }
  else {
    hmac = process.env.IZIPAY_HMAC;
  }
  const answer = req.body.clientAnswer
  
  const hash = req.body.hash
  const answerHash = Hex.stringify(
    hmacSHA256(JSON.stringify(answer), hmac)
  )
  if (hash === answerHash) res.status(200).send('Valid payment')
  else res.status(500).send('Payment hash mismatch')
})

dbConnection()
  .then((connection) => {
    console.log('Successful connection to the database.');
    connection.release();
    app.listen(port, () => {
      console.log('API Server of tennis running');
    });
  })
  .catch((error) => {
    console.error('Error connecting to database: ', error);
  });