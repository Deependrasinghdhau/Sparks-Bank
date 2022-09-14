const express = require("express");
const mongoose = require("mongoose");
// const validator = require("validator");
const app = express();

const transactionSchema = mongoose.Schema({
  sender: {
    type: Number,
  },
  amount: {
    type: Number,
    // min: 3,
    // required: true,
  },
  receiver: {
    type: Number,
    // required: true,
  },
  status: {
    type: String,
    // required: true,
  },
});

const transaction = mongoose.model("Transaction", transactionSchema);
module.exports = transaction;
