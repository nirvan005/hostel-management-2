import { PiStudentFill } from "react-icons/pi";
import { IoBedOutline, IoReorderThree } from "react-icons/io5";
import { MdAssignmentAdd } from "react-icons/md";
import { MdOutlinePayments } from "react-icons/md";
import { IoBagCheckOutline } from "react-icons/io5";
import { NavLink } from "react-router";
import { FaExchangeAlt, FaPlus } from "react-icons/fa";
import { useState } from "react";

function SidebarStudent() {
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
        <div className="sidebar-group">
          <div className="sidebar-subgroup">
            <NavLink
              to="/home-student/new-room"
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
              to="/home-student/change-room"
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

        {/* <NavLink
          to={"/home-student/Payments"}
          state={collapse}
          data-name="Payments"
          onClick={handleClick}
          className={({ isActive }) =>
            `sidebar-btn mb-3 payments ${isActive ? "activeLink" : ""}`
          }
        >
          <MdOutlinePayments />
          Payments
        </NavLink> */}
      </div>
    </>
  );
}
export default SidebarStudent;
