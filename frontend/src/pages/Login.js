import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

const Login = ({ setUser, setAlerts }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      return setError("Please enter username and password");
    }

    setError("");
    setLoading(true);

    try {
      // 1. Login request
      const res = await api.post("/auth/login", { username, password });
      const token = res.data.token;
      localStorage.setItem("token", token);

      // ตั้ง Authorization header สำหรับทุก request
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        username: payload.username,
        role: payload.role,
        tenant: payload.tenant,
      });

      // 2. ส่ง log login สำเร็จ
      await api.post("/ingest", {
        tenant: payload.tenant,
        source: "api",
        event_type: "web_login_success",
        user: payload.username,
        ip: "127.0.0.1",
        reason: "success",
        action: "login",
        "@timestamp": new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (err) {
      // 3. ส่ง log login ล้มเหลว
      try {
        const ingestData = {
          tenant: "demoApi", // ถ้ายังไม่รู้ tenant ของ user
          source: "api",
          event_type: "web_login_failed",
          user: username,
          ip: "127.0.0.1",
          reason: "wrong_password",
          action: "login",
          "@timestamp": new Date().toISOString(),
        };

        console.log("📥 Sending failed login log:", ingestData);
        await api.post("/ingest", ingestData);

        // 4. ตรวจสอบ alert login fail
        const alertRequest = {
          user: username,
          ip: "127.0.0.1",
          tenant: ingestData.tenant,
        };

        console.log("🔍 Checking for alert:", alertRequest);
        const { data } = await api.post(
          "/alerts/check-login-fail",
          alertRequest
        );
        console.log("📢 check-login-fail response:", data);

        if (data.alert) {
          console.log("⚠️ Alert triggered:", data.alert);
          setAlerts((prev) => [...prev, data.alert]);
        } else {
          console.log("✅ No alert triggered");
        }
      } catch (alertErr) {
        console.error("❌ Alert check failed:", alertErr);
      }

      setError(
        err.response?.data?.error ||
          (err.response?.status === 403
            ? "Forbidden: insufficient permissions"
            : "Login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={handleLogin}
        disabled={!username || !password || loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};

export default Login;
