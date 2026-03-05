const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 *
 * - Post route Controller
 * -  Handel registration
 */
// register
async function registerController(req, res) {
  const { email, name, password } = req.body();

  const isExist = await User.findOne({
    email: email,
  });

  if (isExist) {
    res.status(422).json({ message: "Use different email", status: "failed" });
  }

  const newUser = User.create({
    email,
    password,
    name,
  });

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
  });

  res.status(201).json({
    user: {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    },
    token,
  });
}

// login
async function loginController(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(500)
      .json({ message: "Email and Password are required", status: "failed" });
  }

  const isEmailExist = await User.findOne({ email: email });
  if (!isEmailExist) {
    return res.status(500).json({ message: "Invalid Credentials!" });
  }

  const user = await User.findOne({ email: email }).select("+password"); // .select() bcz in schema we have false for pass
  const isValidPassword = user.comparePassword(user.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid Credentials!", status: "failed" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);

  res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token: token,
  });
}

module.exports = {
  registerController,
  loginController,
};
