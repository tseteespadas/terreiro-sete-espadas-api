const mongoose = require("../services/database");

const DesenvolvimentoCourse = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.DesenvolvimentoCourse || mongoose.model("DesenvolvimentoCourse", DesenvolvimentoCourse);
