const mongoose = require("../services/database");

const ErvasCourse = new mongoose.Schema({
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
  mongoose.models.ErvasCourse || mongoose.model("ErvasCourse", ErvasCourse);
