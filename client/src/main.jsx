import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import StudentList from "./components/StudentList.jsx";
import FloorsList from "./components/FloorsList.jsx";
import Room from "./components/Room.jsx";
import Welcome from "./components/Welcome.jsx";
import AddStudent from "./components/AddStudent.jsx";
import Assign from "./components/Assign.jsx";
import ChangeRoom from "./components/ChangeRoom.jsx";
import Payments from "./components/Payments.jsx";
import CheckOuts from "./components/CheckOuts.jsx";
import RemoveStudent from "./components/RemoveStudent.jsx";
import InitialPage from "./components/InitialPage.jsx";
import LoginAdmin from "./components/LoginAdmin.jsx";
import InitialLayoutAdmin from "./components/InitialLayoutAdmin.jsx";
import LoginStudent from "./components/LoginStudent.jsx";
import InitialLayoutStudent from "./components/InitialLayoutStudent.jsx";
import NewRoomStudent from "./components/NewRoomStudent.jsx";
import ChangeRoomStudent from "./components/ChangeRoomStudent.jsx";
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
          { path: "payments", element: <Payments /> },
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
