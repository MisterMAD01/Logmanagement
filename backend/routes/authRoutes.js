const express = require("express");
const router = express.Router();
const { login, profile } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// Login endpoint
router.post("/login", login);

// Check current user
router.get("/me", authenticate(), profile);

module.exports = router;
