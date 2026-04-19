// const Meter = require("../../models/meter/meter.model");

// async function hardwareData(req, res) {
//   const { hardwareID, voltage, current, power, history } = req.body;

//   if (!hardwareID) {
//     return res.status(400).json({ message: "Hardware ID is required" });
//   }
//   if (typeof hardwareID !== "string" || hardwareID.trim() === "") {
//     return res.status(400).json({ message: "Invalid hardware ID" });
//   }

//   if (voltage === undefined || current === undefined || power === undefined) {
//     return res
//       .status(400)
//       .json({ message: "Voltage, current, and power are required" });
//   }

//   const newChartDataEntry = {
//     timestamp: new Date(),
//     voltage,
//     current,
//     power,
//   };

//   const updateQuery = {
//     $set: {
//       voltage: voltage,
//       current: current,
//       power: power,
//     },
//     $push: {
//       chartData: {
//         $each: [newChartDataEntry],
//         $slice: -25,
//         $sort: { timestamp: -1 },
//       },
//     },
//   };

//   if (history) {
//     const newHistoryEntry = {
//       timestamp: new Date(),
//       title: "Power Alert",
//       description: `Power exceeded threshold: ${power}W`,
//     };
//     updateQuery.$push.history = {
//       $each: [newHistoryEntry],
//       $slice: -100,
//       $sort: { timestamp: -1 },
//     };
//   }

//   try {
//     const updatedMeter = await Meter.findOneAndUpdate(
//       { hardwareID },
//       updateQuery,
//       { new: true, runValidators: true },
//     );

//     if (!updatedMeter) {
//       return res
//         .status(404)
//         .json({ message: "Meter not found for the given hardware ID." });
//     }

//     res.status(200).json({
//       message: "Meter data updated successfully",
//       updatedMeter: {
//         thresholdPower: updatedMeter.thresholdPower,
//         armed: updatedMeter.armed,
//         systemStatus: updatedMeter.systemStatus,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating meter data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// module.exports = {
//   hardwareData,
// };




const Meter = require("../../models/meter/meter.model");

async function hardwareData(req, res) {
  const { hardwareID, voltage, current, power, history } = req.body;

  // 1. Validation
  if (!hardwareID || typeof hardwareID !== "string" || hardwareID.trim() === "") {
    return res.status(400).json({ message: "Invalid or missing Hardware ID" });
  }

  if (voltage === undefined || current === undefined || power === undefined) {
    return res.status(400).json({ message: "Voltage, current, and power are required" });
  }

  // 2. Prepare the Update Objects
  const newChartDataEntry = {
    timestamp: new Date(),
    voltage: Number(voltage),
    current: Number(current),
    power: Number(power),
  };

  const updateQuery = {
    $set: {
      voltage: Number(voltage),
      current: Number(current),
      power: Number(power),
      // We assume systemStatus is updated elsewhere or remains as is
    },
    $push: {
      chartData: {
        $each: [newChartDataEntry],
        $slice: -25, // Keep last 25 entries
        $sort: { timestamp: -1 },
      },
    },
  };

  // Add history log if requested (e.g., if hardware detected a spike)
  if (history) {
    const newHistoryEntry = {
      timestamp: new Date(),
      title: "Power Alert",
      description: `Power exceeded threshold: ${power}W`,
    };
    if (!updateQuery.$push) updateQuery.$push = {}; // Ensure $push exists
    updateQuery.$push.history = {
      $each: [newHistoryEntry],
      $slice: -100,
      $sort: { timestamp: -1 },
    };
  }

  try {
    // 3. The Database Operation
    // Setting { new: false } returns the document as it was BEFORE the update
    const previousMeter = await Meter.findOneAndUpdate(
      { hardwareID },
      updateQuery,
      { new: false, runValidators: true }
    );

    if (!previousMeter) {
      return res.status(404).json({ message: "Meter not found." });
    }

    // 4. Capture the "Previous" Value
    // Example: If you need to know if the system was 'true' before this update
    const oldStatus = previousMeter.systemStatus;

    // 5. Send response with the previous values
    res.status(200).json({
      message: "Meter data updated successfully",
      previousState: {
        systemStatus: oldStatus,
        thresholdPower: previousMeter.thresholdPower,
        armed: previousMeter.armed,
        lastPowerRead: previousMeter.power // The value before this new update
      }
    });

  } catch (error) {
    console.error("Error updating meter data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  hardwareData,
};
