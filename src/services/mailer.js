const nodemailer = require('nodemailer');
const mailerConfig = require("../config/mailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: mailerConfig.email,
    pass: mailerConfig.password,
  },
});

transporter.verify().then(console.log).catch(console.error);

module.exports = transporter;
