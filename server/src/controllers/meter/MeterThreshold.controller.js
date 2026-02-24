const Meter = require("../../models/meter/meter.model");

async function MeterThreshold(req, res) {
  const userId = req.user.userId;

  const { hardwareID, thresholdPower } = req.body;

  if (
    !hardwareID ||
    typeof hardwareID !== "string" ||
    hardwareID.trim() === ""
  ) {
    return res.status(400).json({ message: "Valid Hardware ID is required" });
  }
  if (thresholdPower === undefined || typeof thresholdPower !== "number") {
    return res
      .status(400)
      .json({ message: "A valid number for threshold power is required" });
  }

  try {
    const updatedMeter = await Meter.findOneAndUpdate(
      { hardwareID, UserId: userId },
      { thresholdPower },
      {
        returnDocument: "after",
      },
    );

    if (!updatedMeter) {
      return res
        .status(404)
        .json({ message: "Meter not found or access denied" });
    }

    res.status(200).json({
      message: "Meter threshold updated successfully",
      meter: updatedMeter,
    });
  } catch (error) {
    console.error("Error updating meter threshold:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  MeterThreshold,
};
