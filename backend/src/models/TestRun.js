// src/models/TestRun.js
const mongoose = require("mongoose");

const TestRunCaseSchema = new mongoose.Schema(
  {
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestCase",
      required: true,
    },
    result: {
      type: String,
      enum: ["Not Run", "Passed", "Failed", "Blocked"],
      default: "Not Run",
    },
  },
  { _id: false }
);

const TestRunSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cases: [TestRunCaseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestRun", TestRunSchema);
