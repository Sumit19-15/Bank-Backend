const mongoose = require("mongoose");

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token must be present and pass"],
      unique: [true, "Token already blacklist"],
    },
  },
  {
    timestamps: true,
  },
);

blackListSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 3, // 3 days
  },
);

const BlackList = mongoose.model("BlackList", blackListSchema);

module.exports = BlackList;
