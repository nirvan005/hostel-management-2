import logo from "../images/logo.png";
import { MdDateRange } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import AccountMenu from "./AccountMenu";

function HeaderApp() {
  return (
    <>
      <header className="p-3 headApp">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="justify-content-lg-start">
            <a
              href="/"
              className="mb-2 mb-lg-0 text-white text-decoration-none"
            >
              <img
                src={logo}
                alt="logo"
                className="bi me-2"
                width="60"
                height="52"
                role="img"
              />
            </a>
          </div>
          <div className="text-end" style={{ display: "flex" }}>
            <button type="button" className="h-btn">
              <MdDateRange />
            </button>
            <button type="button" className="h-btn2">
              <FaBell />
            </button>
            <AccountMenu />
          </div>
        </div>
      </header>
    </>
  );
}
export default HeaderApp;
