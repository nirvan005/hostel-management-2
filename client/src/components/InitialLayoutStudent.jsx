import { Outlet, useNavigate } from "react-router";
import HeaderApp from "./HeaderApp";
import { useAuth } from "../auth/AuthContext";
import { useEffect } from "react";
import SidebarStudent from "./Sidebar-Student";

const InitialLayoutStudent = () => {
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
      <SidebarStudent />
      <Outlet />
    </div>
  );
};

export default InitialLayoutStudent;
