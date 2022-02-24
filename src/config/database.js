const { DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

module.exports = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster-sete-espadas.pqcfu.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
