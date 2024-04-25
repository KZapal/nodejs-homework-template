const User = require("../mongodb/usersSchema");
const { authSchema } = require("../validation/joi");
const jwt = require("jsonwebtoken");

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
    const newUser = new User({
      email: email,
      password: password,
      subscription: subscription,
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

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
};
