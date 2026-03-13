const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access not allowed , token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findById(decoded.userId);
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Token is invalid Unauthorized person",
    });
  }
}

module.exports = {
  authMiddleware,
};
