const mongoose = require("../services/database");

const Groups = new mongoose.Schema({
  group_id: {
    type: String,
    require: true,
  },
  group_name: {
    type: String,
    require: true,
  }
});

module.exports =
  mongoose.models.Groups || mongoose.model("Groups", Groups);
