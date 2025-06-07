import React, { useEffect } from "react";
import LoginLogo from "react-login-page/logo-rect";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

const InitialPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  useEffect(() => {
    if (auth.isAuthenticated) {
      if (auth.role === "admin") {
        navigate("/home-admin");
      } else if (auth.role === "student") {
        navigate("/home-student");
      }
    }
  }, [auth.isAuthenticated, navigate]);
  return (
    <div
      style={{
        height: "100vh",
        minHeight: 690,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <LoginLogo />
      </div>
      <h2 style={{ color: "#fff" }}>Select Login Type</h2>
      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <button
          style={{
            padding: "12px 32px",
            fontSize: 18,
            borderRadius: 8,
            border: "none",
            background: "#fff",
            color: "#764ba2",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          onClick={() => navigate("/login-admin")}
        >
          Admin
        </button>
        <button
          style={{
            padding: "12px 32px",
            fontSize: 18,
            borderRadius: 8,
            border: "none",
            background: "#fff",
            color: "#667eea",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          onClick={() => navigate("/login-student")}
        >
          Student
        </button>
      </div>
    </div>
  );
};

export default InitialPage;
