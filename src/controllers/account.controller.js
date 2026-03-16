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

async function getAllAccounts(req, res) {
  const userId = req.params;

  const accounts = await Account.find({
    user: userId,
  });

  res.status(200).json({
    message: "Accounts fetch successfully",
    accounts: accounts,
  });
}

async function getAccountBalance(req, res) {
  const { accountId } = req.params;

  // same person asking for same account is check
  const accountExists = await Account.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!accountExists) {
    return res.status(404).json({
      message: "Account not found",
    });
  }

  const balance = await accountExists.getBalance();
  return res.status(200).json({
    message: "Balance Fetch Successfully",
    accountId: accountId,
    balance: balance,
  });
}

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountBalance,
};
