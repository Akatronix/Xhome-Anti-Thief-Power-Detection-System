const mongoose = require("mongoose");

const meterSchema = mongoose.Schema({
  UserId: String,
  hardwareID: String,
  voltage: Number,
  current: Number,
  power: Number,
  thresholdPower: Number,
  armed: Boolean,
  systemStatus: Boolean,
  chartData: [
    {
      timestamp: { type: Date, default: Date.now },
      voltage: Number,
      current: Number,
      power: Number,
    },
  ],
  history: [
    {
      timestamp: { type: Date, default: Date.now },
      title: String,
      description: String,
    },
  ],
});

const Meter = mongoose.model("meter", meterSchema);

module.exports = Meter;
