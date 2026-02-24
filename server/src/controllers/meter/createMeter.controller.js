const Meter = require("../../models/meter/meter.model");
const User = require("../../models/user/user.model");

async function createMeterData(req, res) {
  const userId = req.user.userId;
  const { hardwareID, thresholdPower } = req.body;

  if (!hardwareID) {
    return res.status(400).json({ message: "Hardware ID is required" });
  }

  if (thresholdPower === undefined) {
    return res.status(400).json({ message: "Threshold power is required" });
  }
  if (typeof hardwareID !== "string" || hardwareID.trim() === "") {
    return res.status(400).json({ message: "Invalid hardware ID" });
  }

  try {
    // Check if the user exists first
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a meter with this hardwareID already exists
    const existingMeter = await Meter.findOne({ hardwareID });
    if (existingMeter) {
      return res
        .status(400)
        .json({ message: "Meter with this hardware ID already exists" });
    }

    // If all checks pass, create the new meter
    const newMeter = new Meter({
      UserId: userId,
      hardwareID,
      voltage: 0,
      current: 0,
      power: 0,
      thresholdPower: thresholdPower,
      armed: false,
      systemStatus: false,
    });

    await newMeter.save();

    existingUser.hardwareID = hardwareID;
    await existingUser.save();

    const myUserDataInfo = {
      username: existingUser.username,
      email: existingUser.email,
      hardwareID: existingUser.hardwareID || null,
    };

    res
      .status(201)
      .json({
        message: "Meter data created successfully",
        meter: newMeter,
        user: myUserDataInfo,
      });
  } catch (error) {
    console.error("Error creating meter data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createMeterData,
};
