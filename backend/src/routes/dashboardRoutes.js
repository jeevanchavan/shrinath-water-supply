const express = require("express");
const ctrl    = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/protect");

const router = express.Router();

router.get("/owner",         protect, authorize("owner"),  ctrl.ownerStats);
router.get("/owner/reports", protect, authorize("owner"),  ctrl.ownerReports);
router.get("/driver",        protect, authorize("driver"), ctrl.driverStats);

module.exports = router;
