import React from "react";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faGlobe,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row mt-5 gy-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="logo-box">
              <img src={logo} alt="JobPortal Logo" />
            </div>

            <h5 className="brand">ShnoorJob</h5>

            <p className="desc">
              Your one-stop platform to find your dream job and connect with top companies.
            </p>
          </div>
          <div className="col-6 col-sm-6 col-lg-2">
            <h6 className="footer-title">Quick Links</h6>
            <ul className="list-unstyled">
              {["Jobs", "Companies", "About Us", "Contact"].map((link, i) => (
                <li key={i}>
                  <a href="/" className="footer-link">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-sm-6 col-lg-3">
            <h6 className="footer-title">Connect with Us</h6>

            <div className="social-icons">
              {[faGlobe, faTwitter, faLinkedin, faEnvelope].map((icon, i) => (
                <a key={i} href="/">
                  <FontAwesomeIcon icon={icon} />
                </a>
              ))}
            </div>
          </div>
          <div className="col-12 col-lg-3">
            <h6 className="footer-title">Subscribe</h6>
            <p className="desc">
              Get the latest jobs directly to your inbox
            </p>

            <div className="subscribe-box">
              <input type="email" placeholder="Your email" />
              <button>
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>

        </div>
      </div>
      <div className="footer-bottom">
        <div className="container text-center">
          <small>
            © 2026 <span>ShnoorJob</span>. All rights reserved. | Made with 💚 in India
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;