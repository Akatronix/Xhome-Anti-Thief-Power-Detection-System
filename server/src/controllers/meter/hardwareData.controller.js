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

  // 2. Prepare the Update
  const updateQuery = {
    $set: {
      voltage: Number(voltage),
      current: Number(current),
      power: Number(power),
      systemStatus: false, // Setting system to false as requested
    },
    $push: {
      chartData: {
        $each: [{
          timestamp: new Date(),
          voltage: Number(voltage),
          current: Number(current),
          power: Number(power),
        }],
        $slice: -25,
        $sort: { timestamp: -1 },
      },
    },
  };

  if (history) {
    updateQuery.$push.history = {
      $each: [{
        timestamp: new Date(),
        title: "Power Alert",
        description: `System auto-disabled. Power was: ${power}W`,
      }],
      $slice: -100,
      $sort: { timestamp: -1 },
    };
  }

  try {
    // 3. Perform the Update
    // { new: false } returns the document BEFORE the systemStatus was set to false
    const previousMeter = await Meter.findOneAndUpdate(
      { hardwareID },
      updateQuery,
      { new: false, runValidators: true }
    );

    if (!previousMeter) {
      return res.status(404).json({ message: "Meter not found." });
    }

    // 4. Send response in your exact requested format
    res.status(200).json({
      message: "Meter data updated successfully",
      previousSystemStatus: previousMeter.systemStatus, // The state before the change
      updatedMeter: {
        thresholdPower: previousMeter.thresholdPower,
        armed: previousMeter.armed,
        systemStatus: false, // We know it's false because we just updated it
      },
    });

  } catch (error) {
    console.error("Error updating meter data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { hardwareData };
