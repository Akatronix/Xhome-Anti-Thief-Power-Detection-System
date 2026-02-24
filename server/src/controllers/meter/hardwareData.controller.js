const Meter = require("../../models/meter/meter.model");

async function hardwareData(req, res) {
  const { hardwareID, voltage, current, power, history } = req.body;

  if (!hardwareID) {
    return res.status(400).json({ message: "Hardware ID is required" });
  }
  if (typeof hardwareID !== "string" || hardwareID.trim() === "") {
    return res.status(400).json({ message: "Invalid hardware ID" });
  }

  if (voltage === undefined || current === undefined || power === undefined) {
    return res
      .status(400)
      .json({ message: "Voltage, current, and power are required" });
  }

  const newChartDataEntry = {
    timestamp: new Date(),
    voltage,
    current,
    power,
  };

  const updateQuery = {
    $set: {
      voltage: voltage,
      current: current,
      power: power,
    },
    $push: {
      chartData: {
        $each: [newChartDataEntry],
        $slice: -25,
        $sort: { timestamp: -1 },
      },
    },
  };

  if (history) {
    const newHistoryEntry = {
      timestamp: new Date(),
      title: "Power Alert",
      description: `Power exceeded threshold: ${power}W`,
    };
    updateQuery.$push.history = {
      $each: [newHistoryEntry],
      $slice: -100,
      $sort: { timestamp: -1 },
    };
  }

  try {
    const updatedMeter = await Meter.findOneAndUpdate(
      { hardwareID },
      updateQuery,
      { new: true, runValidators: true },
    );

    if (!updatedMeter) {
      return res
        .status(404)
        .json({ message: "Meter not found for the given hardware ID." });
    }

    res.status(200).json({
      message: "Meter data updated successfully",
      updatedMeter: {
        thresholdPower: updatedMeter.thresholdPower,
        armed: updatedMeter.armed,
        systemStatus: updatedMeter.systemStatus,
      },
    });
  } catch (error) {
    console.error("Error updating meter data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  hardwareData,
};
