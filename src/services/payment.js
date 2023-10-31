const axios = require("axios").default;

const PAYMENT_API_URL = process.env.PAYMENT_API_URL;
const PAYMENT_API_TOKEN = process.env.PAYMENT_API_TOKEN;
const PAYMENT_HEADER_KEY = process.env.PAYMENT_HEADER_KEY;

const paymentAPI = axios.create({
  baseURL: PAYMENT_API_URL,
  headers: {
    accept: "application/json",
    [PAYMENT_HEADER_KEY]: PAYMENT_API_TOKEN,
  },
});

module.exports = paymentAPI;
