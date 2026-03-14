const express = require("express");
const {
  authMiddleware,
  authSystemUserMiddleware,
} = require("../middleware/auth.middleware.js");
const transactionController = require("../controllers/transaction.controller.js");

const router = express.Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */
router.post("/", authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
router.post(
  "/system/initial-funds",
  authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

module.exports = router;
