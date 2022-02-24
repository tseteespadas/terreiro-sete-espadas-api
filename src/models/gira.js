const mongoose = require("../services/database");

const GiraSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startAt: {
    type: Date,
    require: true,
  },
  registrationStartAt: {
    type: Date,
    require: true,
  },
  publicLimit: {
    type: Number,
    default: 20,
  },
});

module.exports = mongoose.models.Gira || mongoose.model("Gira", GiraSchema);
