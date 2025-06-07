import { PiStudentFill } from "react-icons/pi";
import { IoBedOutline, IoReorderThree } from "react-icons/io5";
import { MdAssignmentAdd } from "react-icons/md";
import { MdOutlinePayments } from "react-icons/md";
import { IoBagCheckOutline } from "react-icons/io5";
import { NavLink } from "react-router";
import { FaExchangeAlt, FaPlus } from "react-icons/fa";
import { useState } from "react";

function Sidebar() {
  const handleClick = (e) => {
    setTab(e.target.getAttribute("data-name"));
  };
  let [collapse, setCollapse] = useState(false);
  return (
    <>
      <div
        className="collapse-bar text-white bg-dark"
        onClick={() => setCollapse(!collapse)}
        style={{ cursor: "pointer" }}
      >
        <IoReorderThree />
      </div>
      <div className={`sidebar m-2 ${collapse ? "collapsed" : ""}`}>
        <NavLink
          to={"/home-admin/student"}
          state={{ collapse }}
          data-name="Students"
          onClick={handleClick}
          className={({ isActive }) =>
            `sidebar-btn mb-3 students ${isActive ? "activeLink" : ""}`
          }
        >
          <PiStudentFill />
          Students
        </NavLink>
        <NavLink
          to={"/home-admin/Rooms"}
          state={collapse}
          data-name="Rooms"
          onClick={handleClick}
          className={({ isActive }) =>
            `sidebar-btn mb-3 rooms ${isActive ? "activeLink" : ""}`
          }
        >
          <IoBedOutline />
          Rooms
        </NavLink>
        <div className="sidebar-group">
          <NavLink
            to="/home-admin/assign"
            state={collapse}
            data-name="Assign"
            onClick={handleClick}
            className={({ isActive }) =>
              `sidebar-btn assign ${isActive ? "activeLink" : ""}`
            }
          >
            <MdAssignmentAdd />
            Assign
          </NavLink>

          <div className="sidebar-subgroup ps-4">
            <NavLink
              to="/home-admin/assign/assign-room"
              state={collapse}
              className={({ isActive }) =>
                `sidebar-btn sidebar-btn-sub mb-2 ${
                  isActive ? "activeLink" : ""
                }`
              }
            >
              <FaPlus />
              New Room
            </NavLink>

            <NavLink
              to="/home-admin/assign/change-room"
              state={collapse}
              className={({ isActive }) =>
                `sidebar-btn sidebar-btn-sub ${isActive ? "activeLink" : ""}`
              }
            >
              <FaExchangeAlt />
              Change Room
            </NavLink>
          </div>
        </div>

        <NavLink
          to={"/home-admin/Payments"}
          state={collapse}
          data-name="Payments"
          onClick={handleClick}
          className={({ isActive }) =>
            `sidebar-btn mb-3 payments ${isActive ? "activeLink" : ""}`
          }
        >
          <MdOutlinePayments />
          Payments
        </NavLink>
        <NavLink
          to={"/home-admin/CheckOuts"}
          state={collapse}
          data-name="CheckOuts"
          onClick={handleClick}
          className={({ isActive }) =>
            `sidebar-btn mb-3 checkouts ${isActive ? "activeLink" : ""}`
          }
        >
          <IoBagCheckOutline />
          CheckOuts
        </NavLink>
      </div>
    </>
  );
}
export default Sidebar;
