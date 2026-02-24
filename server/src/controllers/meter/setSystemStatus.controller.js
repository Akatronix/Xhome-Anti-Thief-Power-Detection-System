const Meter = require("../../models/meter/meter.model");

async function setSystemStatus(req, res) {
  const userId = req.user.userId;
  const { hardwareID, systemStatus } = req.body;

  if (
    !hardwareID ||
    typeof hardwareID !== "string" ||
    hardwareID.trim() === ""
  ) {
    return res.status(400).json({ message: "Valid Hardware ID is required" });
  }
  if (systemStatus === undefined || typeof systemStatus !== "boolean") {
    return res
      .status(400)
      .json({ message: "A valid boolean for system status is required" });
  }

  // check if the meter exists and belongs to the user before updating
  const existingMeter = await Meter.findOne({ hardwareID, UserId: userId });
  if (!existingMeter) {
    return res
      .status(404)
      .json({
        message:
          "Meter not found or access denied or it belong to another user",
      });
  }

  try {
    const updatedMeter = await Meter.findOneAndUpdate(
      { hardwareID, UserId: userId },
      { systemStatus },
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
      message: "Meter system status updated successfully",
      meter: updatedMeter,
    });
  } catch (error) {
    console.error("Error updating meter system status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  setSystemStatus,
};
