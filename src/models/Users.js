const mongoose = require("../services/database");

const Users = new mongoose.Schema({
  user_id: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
  },
  token: {
    type: String,
  },
  role: {
    type: String,
    require: true,
    default: "user",
  },
  confirmed: {
    type: Boolean,
    require: true,
    default: false,
  },
  avatarUrl: {
    type: String,
    default: null,
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

module.exports = mongoose.models.Users || mongoose.model("Users", Users);
