const mongoose = require("../services/database");

const GiraNotificationSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.GiraNotification ||
  mongoose.model("GiraNotification", GiraNotificationSchema);
