const mongoose = require("../services/database");

const ZePelintraCourseRegistration = new mongoose.Schema({
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
  mongoose.models.ZePelintraCourseRegistration || mongoose.model("ZePelintraCourseRegistration", ZePelintraCourseRegistration);
