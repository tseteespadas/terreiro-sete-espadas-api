const mongoose = require("../services/database");

const SchedulerLogs = new mongoose.Schema({
  logDate: {
    type: Date,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
  paylod: {
    type: String,
  },
});

module.exports =
  mongoose.models.SchedulerLogs ||
  mongoose.model("SchedulerLogs", SchedulerLogs);
