const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

// create account
router.post("/create", authMiddleware, accountController.createAccount);

// find all accounts
router.get("/", authMiddleware, accountController.getAllAccounts);

// get account balance
router.get("/balance/:accountId", accountController.getAccountBalance);

module.exports = router;
