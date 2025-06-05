const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utility/customError");
const cookieToken = require("../utility/cookieToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  console.log("req.body", req.body);

  if (!name || !email || !password || !role) {
    throw new CustomError("Please provide all the required fields", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (!email || !password) {
    throw new CustomError("Please provide all the required fields", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(404).send({
      status: "fail",
      message: "Please check your email and password",
    });

    throw new CustomError("Invalid credentials", 401);
  }

  const isPasswordCorrect = await user.isValidatedPassword(password);

  if (!isPasswordCorrect) {
    res.status(404).send({
      status: "fail",
      message: "Please check your email and password",
    });

    throw new CustomError("Invalid credentials", 401);
  }

  cookieToken(user, res);
});

// //SOCIAL LOGINS
// exports.googleLogin = BigPromise(async (req, res, next) => {
//   const oAuth2Client = new OAuth2Client(
//     process.env.GOOGLE_OAUTH_CLIENT_ID,
//     process.env.GOOGLE_OAUTH_CLIENT_SECRET,
//     "postmessage"
//   );
//   const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
//   // console.log(tokens);

//   const idToken = tokens.id_token;
//   const decodedToken = jwt.decode(idToken, { complete: true });
//   // 'decodedToken' now contains header and payload
//   const payload = decodedToken.payload;

//   //Check if user exists
//   const user = await User.findOne({ email: payload.email });

//   if (!user) {
//     //Create new user
//     const newUser = await User.create({
//       name: payload.name,
//       email: payload.email,
//       password: payload["sub"],
//       userType: "USER",
//     });

//     cookieToken(newUser, res);
//   }

//   cookieToken(user, res);
// });

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// exports.forgotPassword = BigPromise(async (req, res, next) => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });

//   if (!user) {
//     res.status(404).json({
//       status: "fail",
//       message: "User with this email does not exist",
//     });

//     return next(new CustomError("User with this email does not exist", 404));
//   }
//   try {
//     sendEmailOTPForVerification(user.email);

//     res.status(200).json({
//       status: "success",
//       message: "OTP sent to your email",
//     });
//   } catch (error) {
//     await OTPModel.deleteOne({ email });
//     return next(new CustomError(error.message, 500));
//   }
// });

// exports.passwordReset = BigPromise(async (req, res, next) => {
//   const { otp, password, email } = req.body;

//   // console.log("otp", otp, "password", password, "email", email);

//   // Hash the OTP from the request
//   const hashedOTP = crypto
//     .createHmac("sha256", process.env.EMAIL_SECRET)
//     .update(otp)
//     .digest("hex");

//   // Find the OTP document associated with the otp and email
//   const otpDocument = await OTPModel.findOne({ otp: hashedOTP, email });

//   if (!otpDocument) {
//     res.status(400).json({
//       status: "fail",
//       message: "Invalid email or OTP",
//     });
//     return next(new CustomError("Invalid email or OTP", 400));
//   }

//   const user = await User.findOne({ email });

//   if (!user) {
//     return next(new CustomError("User not found", 404));
//   }

//   user.password = password;
//   await user.save();

//   // Delete the OTP document after successful password reset
//   await OTPModel.deleteOne({ email });

//   cookieToken(user, res);
// });

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  console.log("user", user, req.user._id);

  res.status(200).json({
    status: true,
    data: user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.body.id;
  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  console.log("Update user details");
  const newData = {
    name: req.body.name,
    email: req.body.email,
    mobile: {
      countryCode: req.body?.mobile?.countryCode,
      phone: req.body?.mobile?.phone,
    },
  };

  console.log("newData", newData);

  try {
    const user = await User.findByIdAndUpdate(req.user._id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Error updating user",
    });
  }
});

// exports.emailVerification = BigPromise(async (req, res, next) => {
//   const { email } = req.body;

//   //Check if email already exists

//   const isEmailAlreadyExists = await User.findOne({ email });

//   if (isEmailAlreadyExists) {
//     res.status(400).json({
//       status: "fail",
//       message: "This Email Already Exists",
//     });
//     return next(new CustomError("Email already exists", 400));
//   }

//   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//   function isValidEmail(email) {
//     return emailRegex.test(email);
//   }

//   if (!isValidEmail(email)) {
//     return next(new CustomError("Please provide a valid email", 400));
//   }

//   sendEmailOTPForVerification(email);

//   res.status(200).json({
//     status: "success",
//     message: "Email sent successfully",
//   });
// });

// exports.verifyEmailOTP = BigPromise(async (req, res, next) => {
//   const { email, otp } = req.body;

//   // Compare the provided OTP with the stored OTP (hashed)
//   const hashedOTP = crypto
//     .createHmac("sha256", process.env.EMAIL_SECRET)
//     .update(otp)
//     .digest("hex");

//   console.log("hashedOTP", hashedOTP);

//   const otpDoc = await OTPModel.findOne({ email, otp: hashedOTP });

//   if (!otpDoc) {
//     res.status(400).json({ message: "OTP not found for this email." });
//     return;
//   }
//   console.log("otpDoc.otp", otpDoc.otp);
//   if (otpDoc.otp === hashedOTP) {
//     // OTP is valid, you can delete the OTP document from the database
//     console.log(
//       "OTP is valid, you can delete the OTP document from the database"
//     );
//     await OTPModel.deleteOne({ email, otp });

//     // Update the user's emailVerified field to true

//     res.status(200).json({
//       message: "OTP is valid.",
//       status: true,
//     });
//   } else {
//     await OTPModel.deleteOne({ email, otp });
//     res.status(400).json({ message: "Invalid OTP." });
//   }
// });
