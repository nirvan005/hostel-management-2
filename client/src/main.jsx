import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import InitialPage from "./pages/InitialPage.jsx";
import InitialLayoutAdmin from "./pages/InitialLayoutAdmin.jsx";
import StudentList from "./components/Admin/StudentList.jsx";
import Assign from "./components/Admin/Assign.jsx";
import ChangeRoom from "./components/Admin/ChangeRoom.jsx";
import LoginAdmin from "./components/Admin/LoginAdmin.jsx";
import LoginStudent from "./components/Student/LoginStudent.jsx";
import Welcome from "./components/Welcome.jsx";
import FloorsList from "./components/Admin/FloorsList.jsx";
import Room from "./components/Admin/Room.jsx";
import AddStudent from "./components/AddStudent.jsx";
import RemoveStudent from "./components/RemoveStudent.jsx";
import Payments from "./components/Admin/Payments.jsx";
import CheckOuts from "./components/Admin/CheckOuts.jsx";
import InitialLayoutStudent from "./pages/InitialLayoutStudent.jsx";
import NewRoomStudent from "./components/Student/NewRoomStudent.jsx";
import ChangeRoomStudent from "./components/Student/ChangeRoomStudent.jsx";
import PaymentStudent from "./components/Student/PaymentStudent.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <InitialPage /> },
      { path: "/login-admin", element: <LoginAdmin /> },
      { path: "/login-student", element: <LoginStudent /> },
      {
        path: "/home-admin",
        element: <InitialLayoutAdmin />,
        children: [
          { index: true, element: <Welcome /> },
          { path: "student", element: <StudentList /> },
          { path: "student/add-student", element: <AddStudent /> },
          { path: "student/remove-student", element: <RemoveStudent /> },
          { path: "Rooms", element: <FloorsList /> },
          { path: "student/:room_no", element: <Room /> },
          { path: "assign", element: <Assign /> },
          { path: "assign/assign-room", element: <Assign /> },
          { path: "assign/change-room", element: <ChangeRoom /> },
          { path: "payments", element: <Payments /> },
          { path: "CheckOuts", element: <CheckOuts /> },
        ],
      },
      {
        path: "/home-student",
        element: <InitialLayoutStudent />,
        children: [
          { index: true, element: <Welcome /> },
          { path: "student", element: <StudentList /> },
          { path: "student/add-student", element: <AddStudent /> },
          { path: "student/remove-student", element: <RemoveStudent /> },
          { path: "Rooms", element: <FloorsList /> },
          { path: "student/:room_no", element: <Room /> },
          { path: "new-room", element: <NewRoomStudent /> },
          { path: "change-room", element: <ChangeRoomStudent /> },
          { path: "payments", element: <PaymentStudent /> },
          { path: "CheckOuts", element: <CheckOuts /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
