const Meter = require("../../models/meter/meter.model");

async function handleProtectSystem(req, res) {
  const userId = req.user.userId;
  const { hardwareID, protectStatus } = req.body;

  if (
    !hardwareID ||
    typeof hardwareID !== "string" ||
    hardwareID.trim() === ""
  ) {
    return res.status(400).json({ message: "Valid Hardware ID is required" });
  }
  if (protectStatus === undefined || typeof protectStatus !== "boolean") {
    return res
      .status(400)
      .json({ message: "A valid boolean for protect status is required" });
  }

  try {
    const updatedMeter = await Meter.findOneAndUpdate(
      { hardwareID, UserId: userId },
      { armed: protectStatus },
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
      message: "Meter protect status updated successfully",
      meter: updatedMeter,
    });
  } catch (error) {
    console.error("Error updating meter protect status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handleProtectSystem,
};
