const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_CONN_STRING } = process.env;

module.exports = DB_CONN_STRING.replace("<username>", DB_USERNAME)
  .replace("<password>", DB_PASSWORD)
  .replace("<dbname>", DB_NAME);
