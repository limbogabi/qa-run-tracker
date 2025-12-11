// src/App.tsx
import "./App.css";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import TestCasesPage from "./pages/TestCasesPage";
import TestRunsPage from "./pages/TestRunsPage";

function App() {
  return (
    <div>
      <nav
        style={{
          padding: "1rem",
          borderBottom: "1px solid #ddd",
          marginBottom: "1rem",
          display: "flex",
          gap: "1rem",
        }}
      >
        <Link to="/test-cases">Test Cases</Link>
        <Link to="/test-runs">Test Runs</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/test-cases" replace />} />
        <Route path="/test-cases" element={<TestCasesPage />} />
        <Route path="/test-runs" element={<TestRunsPage />} />
      </Routes>
    </div>
  );
}

export default App;
