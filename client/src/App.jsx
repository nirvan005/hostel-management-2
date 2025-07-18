import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router";
import AuthProvider from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default App;
