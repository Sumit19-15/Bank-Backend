const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

router.post("/", authMiddleware, accountController.createAccount);
router.get("/:userId", authMiddleware.getAllAccounts);
router.get("/balance/:accountId", accountController.getAccountBalance);
module.exports = router;
