const mongoose = require("mongoose");

async function connectToDB() {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Database is connected");
    })
    .catch((err) => {
      console.log("Error is database connection", err);
      process.exit(1);
    });
}

module.exports = connectToDB;
