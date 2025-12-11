// src/pages/TestCasesPage.tsx
import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";


type TestCase = {
  _id: string;
  title: string;
  description?: string;
  status: "Draft" | "Ready" | "Deprecated";
  createdAt?: string;
};

const API_BASE = "http://localhost:3000";

const TestCasesPage: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Draft" | "Ready" | "Deprecated">(
    "Draft"
  );

  // load test cases
  const fetchTestCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/test-cases`);
      if (!res.ok) throw new Error("Failed to fetch test cases");
      const data = await res.json();
      setTestCases(data);
    } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error loading test cases");
        }
      }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/test-cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });
      if (!res.ok) throw new Error("Failed to create test case");
      const created = await res.json();
      setTestCases((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setStatus("Draft");
    } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error creating test case";
        setError(message);
      }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test case?")) return;

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/test-cases/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete test case");
      }
      setTestCases((prev) => prev.filter((tc) => tc._id !== id));
    } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error deleting test case";
        setError(message);
      }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
      <h1>Test Cases</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Create New Test Case</h2>
        <form onSubmit={handleCreate} style={{ display: "grid", gap: "0.5rem", maxWidth: 500 }}>
          <input
            type="text"
            placeholder="Title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TestCase["status"])}
          >
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Deprecated">Deprecated</option>
          </select>

          <button type="submit">Add Test Case</button>
        </form>
      </section>

      <section>
        <h2>Existing Test Cases</h2>

        {loading && <p>Loading…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && testCases.length === 0 && <p>No test cases yet.</p>}

        {testCases.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Title</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Status</th>
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => (
                <tr key={tc._id}>
                  <td style={{ padding: "0.25rem 0" }}>
                    <strong>{tc.title}</strong>
                    {tc.description && (
                      <div style={{ fontSize: "0.9rem", color: "#555" }}>
                        {tc.description}
                      </div>
                    )}
                  </td>
                  <td>{tc.status}</td>
                  <td>
                    <button onClick={() => handleDelete(tc._id)}>Delete</button>
                    {/* future: Edit button, Add to run, etc. */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default TestCasesPage;
