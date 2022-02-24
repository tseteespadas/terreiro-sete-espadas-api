const mongoose = require("mongoose");
const dbConfig = require("../config/database");

mongoose.connect(dbConfig);
mongoose.Promise = global.Promise;

module.exports = mongoose;
