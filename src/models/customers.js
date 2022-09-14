const express = require("express");
const mongoose = require("mongoose");
// const validator = require("validator");
const app = express();

const customerSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    // min: 3,
    // required: true,
  },

  currentbalance: {
    type: Number,
    // required: true,
  },
  accountno: {
    type: Number,
    // required: true,
  },
  phoneno: {
    type: Number,
    // min: 10,
    // required: true,
    // unique: true,
  },
});

const customer = mongoose.model("Customer", customerSchema);
module.exports = customer;
