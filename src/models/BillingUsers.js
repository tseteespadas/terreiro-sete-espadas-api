const mongoose = require("../services/database");

const BillingUsers = new mongoose.Schema({
  id: {
    type: String,
    require: true,
  },
  user_name: {
    type: String,
    require: true,
  },
  user_billing_email: {
    type: String,
    require: true,
  },
  user_email: {
    type: String,
    require: true,
  },
  billing_group_id: {
    type: String,
    require: true,
  },
  active: {
    type: Boolean,
    require: true,
    default: true,
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
  mongoose.models.BillingUsers || mongoose.model("BillingUsers", BillingUsers);
