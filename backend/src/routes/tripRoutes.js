const express = require("express");
const ctrl    = require("../controllers/tripController");
const { protect, authorize } = require("../middleware/protect");

const router = express.Router();

// IMPORTANT: specific driver sub-routes BEFORE /:id to avoid conflicts
router.get("/driver/today",   protect, authorize("driver"), ctrl.getDriverToday);
router.get("/driver/history", protect, authorize("driver"), ctrl.getDriverHistory);

// Owner routes
router.get("/",       protect, authorize("owner"), ctrl.getAll);
router.post("/",      protect, authorize("owner"), ctrl.create);
router.get("/:id",    protect, authorize("owner"), ctrl.getById);
router.delete("/:id", protect, authorize("owner"), ctrl.remove);

// Shared status update (owner & driver)
router.patch("/:id/status", protect, ctrl.updateStatus);

module.exports = router;
