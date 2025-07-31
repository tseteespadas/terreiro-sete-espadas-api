const mongoose = require("mongoose");

const AssistenciaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  pronoums: {
    type: String,
    required: true,
  },
  preferred: {
    type: Boolean,
    default: false,
    required: true,
  },
  called: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GiraAbertaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  assistencia: [AssistenciaSchema],
});

const GiraAberta = mongoose.model("GiraAberta", GiraAbertaSchema);

module.exports = GiraAberta;
