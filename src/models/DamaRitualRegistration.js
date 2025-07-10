const mongoose = require("../services/database");

const DamaRitualRegistration = new mongoose.Schema({
  course_id: {
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
  gender: {
    type: String,
    require: true,
  },
  pronoums: {
    type: String,
    require: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  visited: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.DamaRitualRegistration ||
  mongoose.model("DamaRitualRegistration", DamaRitualRegistration);
