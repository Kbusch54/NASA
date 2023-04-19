const mongoose = require("mongoose");
const launchSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  target: {
    type: String,
    // required: true,
  },
  customers: {
    type: [String],
  },
  upcoming: {
    type: Boolean,
    required: true,
    default: true,
  },
  success: {
    type: Boolean,
    required: true,
    defualt: true,
  },
});

//connects launchesSchema with 'Launch' coolection

module.exports = mongoose.model("Launch", launchSchema);
