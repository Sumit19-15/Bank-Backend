const Account = require("../models/account.model.js");

async function createAccount(req, res) {
  const user = req.user;

  const newAccount = await Account.create({
    user: user._id,
  });

  res.status(201).json({
    Account: newAccount,
  });
}

module.exports = {
  createAccount,
};
