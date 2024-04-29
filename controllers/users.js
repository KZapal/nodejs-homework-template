const User = require("../models/userModel");
const { authSchema } = require("../validation/joi");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs");
const path = require("path");
const jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const signup = async (req, res, next) => {
  const { email, password, subscription } = req.body;
  const { error } = authSchema.validate({ email, password });

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
      avatarURL: avatarURL,
    });

    newUser.setPassword(password);
    await newUser.save();

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

const storeImageDir = path.join(process.cwd(), "public/avatars");

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const image = await jimp.read(req.file.path);
    await image.resize(250, 250);
    const avatarFileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
    const avatarPath = path.join(storeImageDir, avatarFileName);
    await image.write(avatarPath);

    req.user.avatarURL = `/avatars/${avatarFileName}`;
    await req.user.save();

    fs.unlinkSync(req.file.path);

    res.status(200).json({ avatarURL: req.user.avatarURL });
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
};
