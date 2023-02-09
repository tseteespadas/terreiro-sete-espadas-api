const mongoose = require("../services/database");

const UserGroups = new mongoose.Schema({
  group_id: {
    type: String,
    require: true,
  },
  user_id: {
    type: String,
    require: true,
  }
});

module.exports =
  mongoose.models.UserGroups || mongoose.model("UserGroups", UserGroups);
