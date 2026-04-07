import React from "react";
import logo from "../assets/logo.png";

function Footer() {
  const ubuntuFont = { fontFamily: "'Ubuntu', sans-serif" };

  return (
    <footer
      className="py-5"
      style={{
        background: "#0F172A",
        borderTop: "1px solid #1E293B",
        ...ubuntuFont,
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-6 col-md-4 mb-4">
            <div className="d-flex align-items-center mb-3 flex-wrap">
              <img
                src={logo}
                alt="JobPortal Logo"
                style={{ width: "100px", height: "100px", marginRight: "12px" }}
              />
              <h5 style={{ color: "var(--primary)", margin: 0, fontSize: "24px" }}>ShnoorJob</h5>
            </div>
            <p style={{ color: "#94A3B8", lineHeight: "1.8" }}>
              Your one-stop platform to find your dream job and connect with top companies.
            </p>
          </div>
          <div className="col-6 col-sm-6 col-md-2 mb-4">
            <h6 style={{ color: "var(--primary)", marginBottom: "15px" }}>Quick Links</h6>
            <ul className="list-unstyled" style={{ paddingLeft: 0 }}>
              {["Jobs", "Companies", "About Us", "Contact"].map((link, i) => (
                <li key={i} className="mb-2">
                  <a
                    href="/"
                    className="text-decoration-none"
                    style={{ color: "#94A3B8", transition: "color 0.3s" }}
                    onMouseEnter={(e) => (e.target.style.color = "#6366F1")}
                    onMouseLeave={(e) => (e.target.style.color = "#94A3B8")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-sm-6 col-md-3 mb-4">
            <h6 style={{ color: "var(--primary)", marginBottom: "15px" }}>Connect with Us</h6>
            <div className="d-flex gap-3 flex-wrap">
              {[
                { icon: "🌐", link: "#" },
                { icon: "🐦", link: "#" },
                { icon: "💼", link: "#" },
                { icon: "✉️", link: "#" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  style={{
                    fontSize: "24px",
                    color: "#94A3B8",
                    transition: "transform 0.3s, color 0.3s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.2)";
                    e.target.style.color = "#6366F1";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.color = "#94A3B8";
                  }}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-3 mb-4">
            <h6 style={{ color: "var(--primary)", marginBottom: "15px" }}>Subscribe</h6>
            <p style={{ color: "#94A3B8", fontSize: "14px" }}>
              Get the latest jobs directly to your inbox
            </p>
            <div className="d-flex flex-column flex-sm-row">
              <input
                type="email"
                className="form-control mb-2 mb-sm-0 me-sm-2"
                placeholder="Your email"
                style={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px 0 0 8px",
                  transition: "all 0.3s",
                  flex: 1,
                }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 10px #22C55E")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
              <button
                className="btn btn-success"
                style={{
                  borderRadius: "0 8px 8px 0",
                  background: "#6366F1",
                  fontWeight: "bold",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <small style={{ color: "#94A3B8" }}>
            © 2026 ShnoorJob. All rights reserved. | Made with 💚 in India
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;