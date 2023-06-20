const axios = require('axios').default

exports.createFormToken = async paymentConf => {
  // format: 123456789
  const username = process.env.IZIPAY_USERNAME

  // format: testprivatekey_XXXXXXX
  const password = process.env.IZIPAY_PASSPORD

  // format: api.my.psp.domain.name without https
  const endpoint = process.env.IZIPAY_ENDPOINT

  const createPaymentEndpoint = `https://${username}:${password}@${endpoint}/api-payment/V4/Charge/CreatePayment`

  try {
    const response = await axios.post(createPaymentEndpoint, paymentConf, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response?.data?.answer?.formToken) throw response
    return response.data.answer.formToken
  } catch (error) {
    throw error
  }
}
