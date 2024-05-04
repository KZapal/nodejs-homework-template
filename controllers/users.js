const User = require("../models/userModel");
const { authSchema } = require("../validation/joi");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");

const signup = async (req, res, next) => {
  const { email, password, subscription } = req.body;
  const { error } = authSchema.validate({ email, password });
  const verificationToken = uuidv4();

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const existUser = await User.findOne({ email });
  if (existUser) {
    return res.status(409).json({ message: "Email in use" });
  }

  try {
    const avatarURL = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });

    const newUser = new User({
      email: email,
      password: password,
      subscription: subscription,
      verificationToken: verificationToken,
      avatarURL: avatarURL,
    });

    newUser.setPassword(password);
    await newUser.save();

    await newUser.sendVerificationEmail();

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = authSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const existUser = await User.findOne({ email });

    if (!existUser || !(await existUser.validatePassword(password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
    if (!existUser.verify) {
      return res.status(401).json({ message: "Please verify your account!" });
    }

    const token = jwt.sign({ userId: existUser.id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    existUser.token = token;
    existUser.save();

    return res.status(200).json({
      token,
      user: {
        email: existUser.email,
        subscription: existUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (!user.token) {
      return res.status(401).json({
        message: "User is already logged out",
      });
    }

    user.token = null;
    await user.save();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = req.user;
    return res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    await req.user.updateAvatar(req.file);

    res.status(200).json({ avatarURL: req.user.avatarURL });
  } catch (error) {
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const reSendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "missing required field email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    await user.sendVerificationEmail();

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateAvatar,
  verifyUser,
  reSendVerificationEmail,
};
