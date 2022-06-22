const mongoose = require("../services/database");

const UmbandaCourseRegistration = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.UmbandaCourseRegistration || mongoose.model("UmbandaCourseRegistration", UmbandaCourseRegistration);
