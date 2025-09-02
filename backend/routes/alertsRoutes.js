// src/routes/alertRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const {
  checkLoginFail,
  getAllAlerts,
} = require("../controllers/alertController");

router.post("/check-login-fail", checkLoginFail);

router.get("/", authenticate(["Admin", "Viewer"]), getAllAlerts);

module.exports = router;
