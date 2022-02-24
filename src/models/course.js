const mongoose = require("../services/database");

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startAt: {
    type: Date,
    require: true,
  },
  subscriptionDateLimit: {
    type: Date,
    require: true,
  },
  registrationFee: {
    type: Number,
    require: true,
  },
  monthlyFee: {
    type: Number,
    require: true,
  },
});

module.exports =
  mongoose.models.Course || mongoose.model("Course", CourseSchema);
