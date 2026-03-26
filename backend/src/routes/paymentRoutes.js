const express = require("express");
const ctrl    = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/protect");

const router = express.Router();
router.use(protect, authorize("owner"));

router.get("/summary", ctrl.getSummary);
router.get("/history", ctrl.getHistory);
router.post("/collect", ctrl.collect);

module.exports = router;
