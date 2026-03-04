const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 *
 * - Post route Controller
 * -  Handel registration
 */
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

module.exports = {
  registerController,
};
