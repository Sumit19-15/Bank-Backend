const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required field"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid Email address",
      ],
      unique: [true, "Use another Email"],
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Name is required field"],
    },
    password: {
      type: String,
      required: [true, "Password is required field"],
      minlength: [6, "Password too short"],
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hashPass = await bcrypt.hash(this.password, 10);
  this.password = hashPass;
  return;
});

userSchema.methods.comparePassword = async function (pass) {
  return bcrypt.compare(this.password, pass);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
