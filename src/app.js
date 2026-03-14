const express = require("express");
const app = express();
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes.js");
const transactionRouter = require("./routes/transaction.routes.js");

const cookieParser = require("cookie-parser");
app.use(express.json()); // for req.body to read out
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", transactionRouter);

module.exports = app;
