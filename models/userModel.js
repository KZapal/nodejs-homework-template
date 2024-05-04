const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
const sendEmail = require("../config/nodemailer");
const fs = require("fs");
const path = require("path");
const jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    // required: [true, "Verify token is required"], musiałem to zakomentować no bo po prostu nie dało sie przejść weryfikacji
  },
  avatarURL: String,
});

const storeImageDir = path.join(process.cwd(), "public/avatars");

userSchema.methods.setPassword = async function (password) {
  this.password = await bCrypt.hashSync(password, bCrypt.genSaltSync(10));
};

userSchema.methods.validatePassword = function (password) {
  return bCrypt.compare(password, this.password);
};

userSchema.methods.sendVerificationEmail = async function () {
  const verificationLink = `http://localhost:3000/users/verify/${this.verificationToken}`;
  const emailText = `Please click the following link to verify your email: ${verificationLink}`;

  try {
    await sendEmail(this.email, "Verify your email", emailText);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

userSchema.methods.updateAvatar = async function (file) {
  const image = await jimp.read(file.path);
  await image.resize(250, 250);
  const avatarFileName = `${uuidv4()}${path.extname(file.originalname)}`;
  const avatarPath = path.join(storeImageDir, avatarFileName);
  await image.write(avatarPath);

  this.avatarURL = `/avatars/${avatarFileName}`;
  await this.save();

  fs.unlinkSync(file.path);
};

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
