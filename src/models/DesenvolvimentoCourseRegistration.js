const mongoose = require("../services/database");

const DesenvolvimentoCourseRegistration = new mongoose.Schema({
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
  address: {
    type: String,
    require: true,
  },
  cep: {
    type: String,
    require: true,
  },
  number: {
    type: String,
    require: true,
  },
  city: {
    type: String,
    require: true,
  },
  neighborhood: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.DesenvolvimentoCourseRegistration || mongoose.model("DesenvolvimentoCourseRegistration", DesenvolvimentoCourseRegistration);
