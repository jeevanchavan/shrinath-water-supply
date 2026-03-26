const express = require("express");
const ctrl    = require("../controllers/customerController");
const { protect, authorize } = require("../middleware/protect");

const router = express.Router();
router.use(protect, authorize("owner"));

router.get("/",    ctrl.getAll);
router.post("/",   ctrl.create);
router.get("/:id", ctrl.getById);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
