const mongoose = require("../services/database");

const CalendarEventsGroupsSchema = new mongoose.Schema({
  type: String
})

const CalendarEvents = new mongoose.Schema({
  event_id: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
  fromHour: {
    type: Number,
    require: true,
  },
  toHour: {
    type: Number,
    require: true,
  },
  groups: [
    {
      type: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.CalendarEvents || mongoose.model("CalendarEvents", CalendarEvents);
