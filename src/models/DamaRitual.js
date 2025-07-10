const mongoose = require("../services/database");

const DamaRitual = new mongoose.Schema({
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
  mongoose.models.DamaRitual || mongoose.model("DamaRitual", DamaRitual);
