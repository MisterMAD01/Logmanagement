import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import TestPage from "./pages/TestPage";
import LogSearchPage from "./pages/LogSearchPage"; // <-- เพิ่ม import
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);

  // ตรวจสอบ token ใน localStorage ตอนโหลด
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          username: payload.username,
          role: payload.role,
          tenant: payload.tenant,
        });
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Protected TestPage Route */}
        <Route
          path="/test"
          element={user ? <TestPage /> : <Navigate to="/login" />}
        />

        {/* Protected Log Search Route */}
        <Route
          path="/logs-search"
          element={user ? <LogSearchPage /> : <Navigate to="/login" />}
        />

        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />
          }
        />

        {/* Default Route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
