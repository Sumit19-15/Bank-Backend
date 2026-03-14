const Account = require("../models/account.model");
const Transaction = require("../models/transaction.model");
const Ledger = require("../models/ledger.model");
const mongoose = require("mongoose");
/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */
async function createTransaction(req, res) {
  // 1.
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || amount || idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  const fromUserAccount = await Account.findById({
    _id: fromAccount,
  });

  const toUserAccount = await Account.findById({
    _id: toAccount,
  });

  if (!toUserAccount || !fromUserAccount) {
    return res.status(400).json({
      message: "Account not exist either from sender or receiver",
    });
  }

  // 2. validate idempotency key
  const isTransactionExists = await Transaction.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionExists) {
    if (isTransactionExists.status == "Completed") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isTransactionExists,
      });
    }

    if (isTransactionExists.status == "Pending") {
      return res.status(200).json({
        message: "Transaction is Pending wait to completed that one",
      });
    }

    if (isTransactionExists.status == "Failed") {
      return res.status(500).json({
        message: "Transaction Failed , Try again",
      });
    }

    if (isTransactionExists.status == "Reversed") {
      return res.status(500).json({
        message: "Transaction reversed , Try again",
      });
    }
  }

  // 3. Account status

  if (fromUserAccount.status != "ACTIVE" || toUserAccount.status != "ACTIVE") {
    return res.json({
      message:
        "Accounts has some problems. One of them is not in Active status",
    });
  }

  // 4. Sender balance from ledger
  const senderBalance = await fromUserAccount.getBalance();
  if (senderBalance < amount) {
    return res.status(400).json({
      message: "Insufficient balance for this Transaction",
    });
  }

  // 5. Create Transactions
  let transaction;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = await Transaction.create(
      {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "Pending",
      },
      { session },
    );

    const creditLedgerEntry = await Ledger.create(
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
      { session },
    );

    const debitLedgerEntry = await Ledger.create(
      {
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "Debit",
      },
      { session },
    );

    await Transaction.findOneAndUpdate(
      {
        _id: transaction._id,
      },
      {
        status: "Completed",
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issue, please retry after sometime",
    });
  }
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  const toUserAccount = await Account.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await Account.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new Transaction({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await Ledger.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await Ledger.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
