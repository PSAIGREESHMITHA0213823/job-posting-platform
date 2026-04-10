import React from "react";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faGlobe,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faLinkedin } from "@fortawesome/free-brands-svg-icons";

function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg)",
        borderTop: "1px solid #1E293B",
        fontFamily: "'Ubuntu', sans-serif",
      }}
    >
      <div className="container">
        <div className="row mt-5 gy-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <div
              style={{
                width: "90px",
                height: "90px",
                overflow: "hidden",
                border: "2px solid #6366F1",
                borderRadius: "12px",
                boxShadow: "0 6px 16px rgba(99,102,241,0.3)",
                marginBottom: "10px",
              }}
            >
              <img
                src={logo}
                alt="JobPortal Logo"
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <h5
              style={{
                color: "var(--primary)",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              ShnoorJob
            </h5>

            <p
              style={{
                color: "var(--text)",
                fontSize: "14px",
                maxWidth: "280px",
              }}
            >
              Your one-stop platform to find your dream job and connect with top
              companies.
            </p>
          </div>
          <div className="col-6 col-sm-6 col-lg-2">
            <h6 style={{ color: "var(--primary)", marginBottom: "12px" }}>
              Quick Links
            </h6>
            <ul className="list-unstyled">
              {["Jobs", "Companies", "About Us", "Contact"].map((link, i) => (
                <li key={i}>
                  <a
                    href="/"
                    style={{
                      color: "var(--text)",
                      fontSize: "14px",
                      textDecoration: "none",
                      display: "inline-block",
                      marginBottom: "6px",
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-sm-6 col-lg-3">
            <h6 style={{ color: "var(--primary)", marginBottom: "12px" }}>
              Connect with Us
            </h6>

            <div
              style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              {[faGlobe, faTwitter, faLinkedin, faEnvelope].map((icon, i) => (
                <a
                  key={i}
                  href="/"
                  style={{
                    fontSize: "20px",
                    color: "var(--text)",
                  }}
                >
                  <FontAwesomeIcon icon={icon} />
                </a>
              ))}
            </div>
          </div>
          <div className="col-12 col-lg-3">
            <h6 style={{ color: "var(--primary)", marginBottom: "12px" }}>
              Subscribe
            </h6>

            <p
              style={{
                color: "var(--text)",
                fontSize: "14px",
              }}
            >
              Get the latest jobs directly to your inbox
            </p>

<div
  style={{
    display: "flex",
    width: "100%",
    background: "#1E293B",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid rgba(148,163,184,0.2)",
  }}
>
  <input
    type="email"
    placeholder="Your email"
    style={{
      flex: "1 1 auto", 
      minWidth: "0",
      border: "none",
      outline: "none",
      background: "transparent",
      color: "#fff",
      padding: "10px",
      fontSize: "14px",
    }}
  />

  <button
    style={{
      background: "var(--primary)",
      border: "none",
      padding: "0 16px",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0, 
    }}
  >
    <FontAwesomeIcon icon={faPaperPlane} />
  </button>
</div>
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(148,163,184,0.2)",
          marginTop: "40px",
          padding: "15px 0",
          textAlign: "center",
        }}
      >
        <small style={{ color: "var(--text)", fontSize: "13px" }}>
          © 2026{" "}
          <span style={{ color: "var(--primary)", fontWeight: "600" }}>
            ShnoorJob
          </span>
          . All rights reserved. | Made with 💚 in India
        </small>
      </div>
    </footer>
  );
}

export default Footer;