import { useState } from "react";
import "./App.css";
import HeaderApp from "./components/HeaderApp";
import Sidebar from "./components/Sidebar";
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
