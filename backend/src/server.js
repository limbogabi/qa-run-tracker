// src/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const TestCase = require("./models/TestCase");
const TestRun = require("./models/TestRun");

const { swaggerUi, swaggerSpec } = require("./swagger");




const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Simple health check route ---
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns API status.
 *     responses:
 *       200:
 *         description: API is healthy
 */

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "QA Run Tracker API is running" });
});




// GET /api/test-cases - list all
/**
 * @swagger
 * /api/test-cases:
 *   get:
 *     summary: Get all test cases
 *     tags: [TestCases]
 *     responses:
 *       200:
 *         description: List of test cases
 */

app.get("/api/test-cases", async (req, res) => {
    const testCases = await TestCase.find().sort({ createdAt: -1 });
    res.json(testCases);
  });
  

// POST /api/test-cases - create new
/**
 * @swagger
 * /api/test-cases:
 *   post:
 *     summary: Create a new test case
 *     tags: [TestCases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Draft, Ready, Deprecated]
 *     responses:
 *       201:
 *         description: Test case created
 */

app.post("/api/test-cases", async (req, res) => {
    const { title, description, status } = req.body;
    const newCase = await TestCase.create({
      title,
      description,
      status
    });
    res.status(201).json(newCase);
  });
  

// DELETE /api/test-cases/:id - delete one
/**
 * @swagger
 * /api/test-cases/{id}:
 *   delete:
 *     summary: Delete a test case
 *     tags: [TestCases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test case ID
 *     responses:
 *       204:
 *         description: Test case deleted
 *       404:
 *         description: Test case not found
 */

app.delete("/api/test-cases/:id", async (req, res) => {
    await TestCase.findByIdAndDelete(req.params.id);
    res.status(204).send();
  });

// --- Test Run endpoints ---

// POST /api/test-runs
/**
 * @swagger
 * /api/test-runs:
 *   post:
 *     summary: Create a new test run
 *     tags: [TestRuns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               cases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     testCaseId:
 *                       type: string
 *                     result:
 *                       type: string
 *                       enum: [Not Run, Passed, Failed, Blocked]
 *     responses:
 *       201:
 *         description: Test run created
 */

app.post("/api/test-runs", async (req, res) => {
    try {
      const { name, cases } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
  
      const run = await TestRun.create({ name, cases: cases || [] });
      res.status(201).json(run);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create test run" });
    }
  });
  
  // GET /api/test-runs
  /**
 * @swagger
 * /api/test-runs:
 *   get:
 *     summary: Get all test runs
 *     tags: [TestRuns]
 *     responses:
 *       200:
 *         description: List of test runs
 */

  app.get("/api/test-runs", async (req, res) => {
    const runs = await TestRun.find()
      .populate("cases.testCaseId")
      .sort({ createdAt: -1 });
    res.json(runs);
  });
  
  // GET /api/test-runs/:id
  /**
 * @swagger
 * /api/test-runs/{id}:
 *   get:
 *     summary: Get a single test run
 *     tags: [TestRuns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test run ID
 *     responses:
 *       200:
 *         description: Test run data
 *       404:
 *         description: Test run not found
 */

  app.get("/api/test-runs/:id", async (req, res) => {
    const run = await TestRun.findById(req.params.id).populate(
      "cases.testCaseId"
    );
    if (!run) return res.status(404).json({ error: "Test run not found" });
    res.json(run);
  });
  
  // PATCH /api/test-runs/:runId/cases/:caseId
  /**
 * @swagger
 * /api/test-runs/{runId}/cases/{caseId}:
 *   patch:
 *     summary: Update the result of a test case in a run
 *     tags: [TestRuns]
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *         description: Test run ID
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Test case ID inside the run
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result:
 *                 type: string
 *                 enum: [Not Run, Passed, Failed, Blocked]
 *     responses:
 *       200:
 *         description: Updated test run
 *       400:
 *         description: Invalid result value
 *       404:
 *         description: Test run or test case not found
 */

  app.patch("/api/test-runs/:runId/cases/:caseId", async (req, res) => {
    const { runId, caseId } = req.params;
    const { result } = req.body;
  
    const allowed = ["Not Run", "Passed", "Failed", "Blocked"];
    if (!allowed.includes(result)) {
      return res.status(400).json({ error: "Invalid result value" });
    }
  
    const run = await TestRun.findById(runId);
    if (!run) return res.status(404).json({ error: "Test run not found" });
  
    const caseEntry = run.cases.find(
      (c) => c.testCaseId.toString() === caseId
    );
    if (!caseEntry) {
      return res
        .status(404)
        .json({ error: "Test case not found in this run" });
    }
  
    caseEntry.result = result;
    await run.save();
  
    const updated = await TestRun.findById(runId).populate("cases.testCaseId");
    res.json(updated);
  });
  
  // DELETE /api/test-runs/:id
  /**
 * @swagger
 * /api/test-runs/{id}:
 *   delete:
 *     summary: Delete a test run
 *     tags: [TestRuns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test run ID
 *     responses:
 *       204:
 *         description: Test run deleted
 *       404:
 *         description: Test run not found
 */

  app.delete("/api/test-runs/:id", async (req, res) => {
    const deleted = await TestRun.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Test run not found" });
    res.status(204).send();
  });

  //Swagger API
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  
  

// --- MongoDB connection (prep for later) ---

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn(
        "⚠️ No MONGO_URI found in .env – starting server without database connection."
      );
      console.warn("   You can still use the in-memory testCases for now.");
    } else {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(mongoUri);
      console.log("✅ Connected to MongoDB");
    }

    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
