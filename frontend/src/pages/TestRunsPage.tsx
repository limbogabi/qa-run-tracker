// src/pages/TestRunsPage.tsx
import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";

type TestCase = {
  _id: string;
  title: string;
};

type RunCase = {
  testCaseId: {
    _id: string;
    title: string;
  };
  result: "Not Run" | "Passed" | "Failed" | "Blocked";
};

type TestRun = {
  _id: string;
  name: string;
  cases: RunCase[];
  createdAt?: string;
};

const API_BASE = "http://localhost:3000";

const TestRunsPage: React.FC = () => {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);

  // ---- helpers ----
  const toggleSelectedCase = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ---- load test runs ----
  const fetchRuns = async () => {
    try {
      setLoadingRuns(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/test-runs`);
      if (!res.ok) throw new Error("Failed to fetch test runs");

      const data = await res.json();
      setRuns(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error loading test runs";
      setError(message);
    } finally {
      setLoadingRuns(false);
    }
  };

  // ---- load test cases (for selection) ----
  const fetchTestCases = async () => {
    try {
      setLoadingCases(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/test-cases`);
      if (!res.ok) throw new Error("Failed to fetch test cases");

      const data = await res.json();
      setTestCases(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error loading test cases";
      setError(message);
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    fetchTestCases();
  }, []);

  // ---- create run with selected cases ----
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setError(null);

      const casesPayload = selectedCaseIds.map((id) => ({
        testCaseId: id,
        result: "Not Run" as const,
      }));

      const res = await fetch(`${API_BASE}/api/test-runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cases: casesPayload }),
      });

      if (!res.ok) throw new Error("Failed to create test run");

      const created = await res.json();
      setRuns((prev) => [created, ...prev]);
      setName("");
      setSelectedCaseIds([]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error creating test run";
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test run?")) return;

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/test-runs/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete test run");
      }

      setRuns((prev) => prev.filter((r) => r._id !== id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error deleting test run";
      setError(message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
      <h1>Test Runs</h1>

      {/* CREATE RUN */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Create New Test Run</h2>

        <form
          onSubmit={handleCreate}
          style={{ display: "grid", maxWidth: 500, gap: "0.75rem" }}
        >
          <input
            type="text"
            placeholder="Run name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <h3 style={{ margin: "0.5rem 0" }}>Select Test Cases</h3>
            {loadingCases && <p>Loading test cases…</p>}
            {!loadingCases && testCases.length === 0 && (
              <p>No test cases available. Create some first.</p>
            )}

            {!loadingCases && testCases.length > 0 && (
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: "0.5rem",
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {testCases.map((tc) => (
                  <label
                    key={tc._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCaseIds.includes(tc._id)}
                      onChange={() => toggleSelectedCase(tc._id)}
                    />
                    <span>{tc.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={!name.trim()}>
            Create Run with Selected Cases
          </button>
        </form>
      </section>

      {/* LIST RUNS */}
      <section>
        <h2>Existing Test Runs</h2>
        {loadingRuns && <p>Loading runs…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loadingRuns && runs.length === 0 && <p>No runs created yet.</p>}

        {runs.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {runs.map((run) => (
              <li
                key={run._id}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "0.75rem 0",
                }}
              >
                <strong>{run.name}</strong>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {run.cases.length} test cases
                </div>

                <button onClick={() => handleDelete(run._id)}>Delete</button>
                {/* later: link to detail page */}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default TestRunsPage;
