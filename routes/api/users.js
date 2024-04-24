const express = require("express");
const router = express.Router();
const users = require("../../models/users");
const authCheck = require("../../middleware");

// Signup
router.post("/signup", users.signup);

// Login
router.post("/login", users.login);

// Logout
router.get("/logout", authCheck, users.logout);

// Current
router.get("/current", authCheck, users.getCurrentUser);

module.exports = router;
