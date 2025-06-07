import { Outlet, useNavigate } from "react-router";
import HeaderApp from "./HeaderApp";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import { useEffect } from "react";

const InitialLayoutAdmin = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/");
    }
    return () => {
      // auth.logout(); prevent logout on unmount or even reload
    };
  }, []);
  return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <HeaderApp />
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default InitialLayoutAdmin;
