import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../theams/theam.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Companies", path: "/companies" },
    { name: "About us", path: "/about-us" },
  ];

  return (
    <nav
      className="navbar navbar-expand-lg  shadow-sm"
      style={{
        backgroundColor: "var(--bg)",
        borderBottom: "1px solid #1E293B",
        transition: "all 0.3s ease",
      }}
    >
      <div className="container d-flex align-items-center justify-content-between">
        <Link
            className="navbar-brand d-flex align-items-center mb-0"
            to="/"
            style={{ color: "var(--text)" }}
          >
            <div
              className="logo-box"
              style={{
                width: 80,
                height: 80,
                overflow: "hidden",
                border: "1px solid var(--primary)",
                boxShadow: "0 0 5px rgba(99,102,241,0.4)"
              }}
            >
              <img
                src={logo}
                alt=" ShnoorJob"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <span
              className="fw-bold text-uppercase ms-2"
              style={{
                fontFamily: "'Ubuntu', sans-serif",
                letterSpacing: "1px",
                color: "var(--text)",
                fontSize: "25px"
              }}
            >
               ShnoorJob
            </span>
          </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            borderColor: "#334155",
            backgroundColor: "var(--surface)",
            transition: "transform 0.3s",
          }}
        >
          <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center">
            {menuItems.map((item) => (
              <li className="nav-item mx-3" key={item.name}>
                <NavLink
                  to={item.path}
                  className="nav-link"
                  style={({ isActive }) => ({
                    color: isActive ? "var(--primary)" : "var(--text)",
                    fontWeight: isActive ? 600 : 500,
                    borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                    transition: "all 0.3s",
                  })}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
            <li className="d-flex gap-2 ms-3 mt-3 mt-lg-0">
              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px 18px",
                  fontWeight: 500,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-outline-primary"
                style={{
                  border: "2px solid var(--primary)",
                  color: "var(--primary)",
                  borderRadius: "8px",
                  padding: "6px 18px",
                  fontWeight: 500,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--primary)";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--primary)";
                }}
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .logo-box { width: 50px !important; height: 50px !important; }
            .navbar-brand span { font-size: 1.2rem !important; }
            .navbar-nav { text-align: center; }
            .d-flex.align-items-center.gap-2 { justify-content: center; margin-top: 1rem; }
          }
          @media (max-width: 480px) {
            .logo-box { width: 40px !important; height: 40px !important; }
            .navbar-brand span { font-size: 1rem !important; }
            .navbar-nav li { margin: 0.5rem 0 !important; }
          }
          .nav-link:hover { color: var(--primary); transform: scale(1.1); }
        `}
      </style>
    </nav>
  );
};

export default Navbar;