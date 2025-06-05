const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  // forgotPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  // passwordReset,
  // googleLogin,
  // emailVerification,
  // verifyEmailOTP,
} = require("../controllers/userControllers");

const { isLoggedIn } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
// router.route("/forgot-password").post(forgotPassword);
// router.route("/reset-password").post(passwordReset);
// router.route("/email-verification").post(emailVerification);
// router.route("/email-verification/verify").post(verifyEmailOTP);
router.route("/user").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(changePassword);
router.route("/user/update").post(isLoggedIn, updateUserDetails);

// Google OAuth

// Route to exchange code for tokens
//router.route("/auth/google").post(googleLogin);

module.exports = router;
