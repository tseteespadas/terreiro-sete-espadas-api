const mongoose = require("../services/database");

const CourseRegistrationSchema = new mongoose.Schema({
  courseId: {
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
  mongoose.models.CourseRegistration ||
  mongoose.model("CourseRegistration", CourseRegistrationSchema);
