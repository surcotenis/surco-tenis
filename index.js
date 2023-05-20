require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT||5000
const dbConnection = require('./core/db_config');
const testRouter = require("./routes/test")

app.use(express.json())
app.use(cors())


app.use("/api/test",testRouter)


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
