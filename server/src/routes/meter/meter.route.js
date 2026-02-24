const express = require("express");
const {
  createMeterData,
} = require("../../controllers/meter/createMeter.controller");
const {
  hardwareData,
} = require("../../controllers/meter/hardwareData.controller");
const {
  MeterThreshold,
} = require("../../controllers/meter/MeterThreshold.controller");
const { verifyUser } = require("../../middlewares/VerifyUser");
const {
  setSystemStatus,
} = require("../../controllers/meter/setSystemStatus.controller");
const {
  handleProtectSystem,
} = require("../../controllers/meter/handleProtectSystem.controlller");

const router = express.Router();

router.post("/create", verifyUser, createMeterData);
router.post("/hardware", hardwareData);
router.post("/threshold", verifyUser, MeterThreshold);
router.post("/status", verifyUser, setSystemStatus);
router.post("/protect", verifyUser, handleProtectSystem);

module.exports = router;
