import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import "../theams/theam.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{ backgroundColor: "var(--bg)", borderBottom: "1px solid #1E293B" }}
    >
      <div className="container">
        <NavLink
          className="navbar-brand d-flex align-items-center fw-bold fs-3"
          to="/"
          style={{ color: "var(--primary)", fontFamily: "'Ubuntu', sans-serif" }}
        >
          <img
            src={logo}
            alt="ShnoorJob Logo"
            style={{ width: "60px", height: "60px" }}
          />
          <span style={{ marginLeft: "15px", fontSize: "1.8rem" }}>ShnoorJob</span>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={isOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {[
              { name: "Home", path: "/" },
              { name: "Jobs", path: "/jobs" },
              { name: "Companies", path: "/companies" },
              { name: "About us", path: "/about-us" },
              { name: "Login", path: "/login" },
            ].map((item) => (
              <li className="nav-item mx-2" key={item.name}>
                <NavLink
                  to={item.path}
                  className="nav-link"
                  style={({ isActive }) => ({
                    color: isActive ? "var(--primary)" : "#ffffff",
                    fontWeight: isActive ? "600" : "500",
                    borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                    transition: "0.3s",
                  })}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;