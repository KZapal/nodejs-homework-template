const express = require("express");
const router = express.Router();
const users = require("../../controllers/users");
const authCheck = require("../../config/authCheck");
const uploadMiddleware = require("../../config/multer");

// Signup
router.post("/signup", users.signup);

// Login
router.post("/login", users.login);

// Logout
router.get("/logout", authCheck, users.logout);

// Current
router.get("/current", authCheck, users.getCurrentUser);

// Update avatar
router.patch(
  "/avatars",
  authCheck,
  uploadMiddleware.single("avatar"),
  users.updateAvatar
);

// Verification email
router.get("/verify/:verificationToken", users.verifyUser);

// Re send varivication email
router.post("/verify", users.reSendVerificationEmail);

module.exports = router;
