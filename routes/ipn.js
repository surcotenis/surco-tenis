const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/*router.post('/', (req, res) => {
  try {
    const { body } = req;
    console.log(body)
    // Paso 1: Verificar la firma
    const hmac = process.env.MODE === "TEST" ? process.env.IZIPAY_HMAC_TEST : process.env.IZIPAY_HMAC;
    const receivedHash = body['kr-hash'];
    const krAnswer = body['kr-answer'];
    const hashAlgorithm = body['kr-hash-algorithm'];
console.log(checkHash(krAnswer, hmac, hashAlgorithm, receivedHash))
    if (checkHash(krAnswer, hmac, hashAlgorithm, receivedHash)) {
      // Paso 2: Verificar el estado de la transacción
      const krAnswerObject = JSON.parse(krAnswer);
      if (krAnswerObject.orderStatus === 'PAID') {
        // Procesa la notificación aquí
        res.status(200).send('Valid payment');
      } else {
        res.status(400).send('Invalid payment status');
      }
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Error processing IPN:', error);
    res.status(500).send('Internal server error');
  }
});*/


router.get('/',(req,res) => {
  
    res.json("datos");

});

router.post('/',(req,res) => {

    //console.log(req.body);
    const respuesta = {...req.body};

    //datos.push(respuesta);

    res.json(respuesta);

        

});

function checkHash(krAnswer, key, algorithm, receivedHash) {
  const supportedSignAlgos = ['sha256_hmac'];
  if (!supportedSignAlgos.includes(algorithm)) {
    return false;
  }

  const hash = crypto.createHmac('sha256', key)
    .update(krAnswer)
    .digest('hex');

  return hash === receivedHash;
}

module.exports = router;
