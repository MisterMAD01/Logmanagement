const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/logController");
const { authenticate } = require("../middleware/auth");

// Admin / Viewer สามารถเข้าถึง logs
router.get("/", authenticate(["Admin", "Viewer"]), getLogs);

module.exports = router;
