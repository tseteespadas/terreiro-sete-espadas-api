const mongoose = require("../services/database");

const BillingValueGroups = new mongoose.Schema({
  id: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  value: {
    type: Number,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.BillingValueGroups ||
  mongoose.model("BillingValueGroups", BillingValueGroups);
