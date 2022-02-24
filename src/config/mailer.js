const { 
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
} = process.env;

module.exports = {
  email: EMAIL_USERNAME,
  password: EMAIL_PASSWORD
}