// src/models/TestCase.js
const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Ready", "Deprecated"],
      default: "Draft",
    }
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

const TestCase = mongoose.model("TestCase", testCaseSchema);

module.exports = TestCase;
