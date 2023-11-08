const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'signupcollection',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    required: true,
  },
  transactions: [transactionSchema],
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
