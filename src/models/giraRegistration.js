const mongoose = require("../services/database");

const GiraRegistrationSchema = new mongoose.Schema({
  giraId: {
    type: mongoose.ObjectId,
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
  mongoose.models.GiraRegistration ||
  mongoose.model("GiraRegistration", GiraRegistrationSchema);
