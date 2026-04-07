import React from "react";
import Navbar from "../landing-page-componets/Navbar";
import "../theams/theam.css";
import job from "../assets/job.jpg";
import { Zap, UserCheck, LayoutDashboard, Shield } from "lucide-react";
import Footer from "./Footer";

function Home() {
  const ubuntuFont = { fontFamily: "'Ubuntu', sans-serif" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", ...ubuntuFont }}>
     <div className="mb-5">
         <Navbar />
     </div>
<section className="container py-5">
  <div className="row align-items-center">
    <div className="col-12 col-md-6 text-center text-md-start">
      <h1
        className="fw-bold"
        style={{
          color: "var(--primary)",
          fontSize: "clamp(2rem, 5vw, 4.5rem)",
          lineHeight: "1.2",
          ...ubuntuFont,
        }}
      >
        Find Your <br /> <span className="text-accent">Dream Job</span> 🚀
      </h1>
      <p
        className="text-secondary-custom"
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          ...ubuntuFont,
        }}
      >
        Explore thousands of job opportunities or hire the best candidates easily.
      </p>

      <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 mt-4 mt-md-5">
        <button
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "var(--primary)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.3s",
            ...ubuntuFont,
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#4F46E5")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--primary)")}
        >
          Post Job
        </button>
        <button
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "var(--secondary)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.3s",
            ...ubuntuFont,
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#16A34A")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--secondary)")}
        >
          Find Jobs
        </button>
      </div>
    </div>
    <div className="col-12 col-md-6 text-center mt-4 mt-md-0">
      <img
        src={job}
        alt="Hero Illustration"
        style={{
          maxHeight: "350px",
          width: "100%",
          objectFit: "contain",

        }}
      />
    </div>
  </div>
</section>

      <div className="container my-5">
        <div
          className="p-4 rounded shadow"
          style={{ backgroundColor: "#1E293B" }}
        >
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                placeholder="Job title"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                  backgroundColor: "#111827",
                  color: "#E2E8F0",
                  ...ubuntuFont,
                }}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                placeholder="Location"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                  backgroundColor: "#111827",
                  color: "#E2E8F0",
                  ...ubuntuFont,
                }}
              />
            </div>

            <div className="col-md-3">
              <select
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                  backgroundColor: "#111827",
                  color: "#E2E8F0",
                  ...ubuntuFont,
                }}
              >
                <option value="">Category</option>
                <option value="IT">IT</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="col-md-3">
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#6366F1",
                  color: "#111827",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "0.3s",
                  ...ubuntuFont,
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#16A34A")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#6366F1")
                }
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
<section className="container py-5">
  <h2
    className="fw-bold mb-4"
    style={{ color: "var(--primary)", ...ubuntuFont }}
  >
    Featured Jobs
  </h2>

  <div className="row">
    {[1, 2, 3].map((item) => (
      <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={item}>
        <div
          className="d-flex flex-column justify-content-between p-3"
          style={{
            backgroundColor: "#1E293B",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            height: "100%",
          }}
        >
          <div>
            <h5 style={{ color: "#fff", ...ubuntuFont }}>Software Engineer</h5>
            <p style={{ color: "#94A3B8", ...ubuntuFont }}>Mumbai</p>
            <p style={{ color: "var(--secondary)", ...ubuntuFont }}>₹6L - ₹12L</p>
          </div>

          <button
            className="btn fw-bold mt-3"
            style={{
              borderRadius: "8px",
              backgroundColor: "var(--primary)",
              color: "#fff",
              ...ubuntuFont,
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#4F46E5")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "var(--primary)")
            }
          >
            Apply
          </button>
        </div>
      </div>
    ))}
  </div>

  <div className="text-center mt-4">
    <button
      className="btn btn-outline-primary px-4 py-2"
      style={{ borderRadius: "8px", fontWeight: "bold", ...ubuntuFont }}
    >
      See More Featured Jobs
    </button>
  </div>
</section>

<section className="container py-5">
  <h2
    className="fw-bold mb-4"
    style={{ color: "var(--primary)", ...ubuntuFont }}
  >
    Categories
  </h2>

  <div className="row">
    {["IT", "Design", "Marketing", "Finance", "HR", "Sales"].map(
      (cat) => (
        <div className="col-md-4 mb-4" key={cat}>
          <div
            style={{
              backgroundColor: "#1E293B",
              borderRadius: "16px",
              padding: "50px 20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              transition: "transform 0.3s, box-shadow 0.3s",
              cursor: "pointer",
              textAlign: "center",
              height: "100%",
            }}
            className="category-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
            }}
          >
            <h5 style={{ color: "#fff", ...ubuntuFont, fontSize: "20px" }}>
              {cat}
            </h5>
            <small style={{ color: "#94A3B8", ...ubuntuFont }}>
              100 Jobs
            </small>
          </div>
        </div>
      )
    )}
  </div>


  <div className="text-center mt-4">
        <button
      className="btn btn-outline-primary px-4 py-2"
      style={{ borderRadius: "8px", fontWeight: "bold", ...ubuntuFont }}
    >
      See More Categories
    </button>
  </div>
</section>

<section
  className="d-flex flex-column align-items-center justify-content-center py-5 px-3 px-md-5 mx-3 mx-md-5 mt-5"
  style={{
    backgroundColor: "#1E293B",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  }}
>
  <h2
    className="fw-bold text-center mb-3 fs-1 fs-md-1"
    style={{ color: "var(--primary)", ...ubuntuFont }}
  >
    Ready to Get Started?
  </h2>
  <p
    className="text-center text-secondary-custom mb-5 fs-5 fs-md-4"
    style={{ ...ubuntuFont, maxWidth: "700px" }}
  >
    Start hiring or find your dream job today.
  </p>

  <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
    <button
      className="fw-bold"
      style={{
        padding: "12px 24px",
        borderRadius: "12px",
        border: "none",
        background: "linear-gradient(90deg, #22C55E, #16A34A)",
        color: "#fff",
        cursor: "pointer",
        fontSize: "1rem",
        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        ...ubuntuFont,
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-3px)";
        e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
      }}
    >
      Post Job
    </button>

    <button
      className="fw-bold"
      style={{
        padding: "12px 24px",
        borderRadius: "12px",
        border: "none",
        background: "linear-gradient(90deg, #4F46E5, #6366F1)",
        color: "#fff",
        cursor: "pointer",
        fontSize: "1rem",
        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        ...ubuntuFont,
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-3px)";
        e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
      }}
    >
      Find Jobs
    </button>
  </div>
</section>

<section className="container py-5">
  <h2
    className="text-center mb-5 fw-bold mt-5"
    style={{ fontFamily: "'Ubuntu', sans-serif", color: "var(--primary)", fontSize: "48px" }}
  >
    Why Choose Us
  </h2>

  <div className="row g-4">
    {[
      {
        icon: <Zap size={36} className="text-white" />,
        title: "Fast Hiring",
        desc: "Quickly connect with the right candidates for your needs.",
        bg: "linear-gradient(135deg, #6366F1, #4F46E5)"
      },
      {
        icon: <UserCheck size={36} className="text-white" />,
        title: "Verified Candidates",
        desc: "Every candidate is verified for credibility and quality.",
        bg: "linear-gradient(135deg, #10B981, #059669)"
      },
      {
        icon: <LayoutDashboard size={36} className="text-white" />,
        title: "Easy Dashboard",
        desc: "Manage your hiring process effortlessly in one place.",
        bg: "linear-gradient(135deg, #6366F1, #4F46E5)"
      },
      {
        icon: <Shield size={36} className="text-white" />,
        title: "Secure Platform",
        desc: "Your data and hiring process are safe with us.",
        bg: "linear-gradient(135deg, #10B981, #059669)"
      }
    ].map((item, index) => (
      <div className="col-md-6 col-lg-3" key={index}>
        <div
          className="p-4 rounded-3 shadow text-center text-white"
          style={{
            background: item.bg,
            transition: "transform 0.3s, box-shadow 0.3s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
          }}
        >
          <div
            className="mb-3 d-flex align-items-center justify-content-center rounded-circle mx-auto"
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            {item.icon}
          </div>
          <h5 className="fw-bold mt-3">{item.title}</h5>
          <p className="mt-2">{item.desc}</p>
        </div>
      </div>
    ))}
  </div>
</section>


<section className="container py-5">
  <h2
    className="text-center mb-5 fw-bold mt-5"
    style={{ fontFamily: "'Ubuntu', sans-serif", color: "var(--primary)", fontSize: "48px" }}
  >
    What Our Users Say
  </h2>

  <div className="row g-4">
    {[
      {
        icon: "👨‍💻",
        name: "John Doe",
        review: "This platform helped me land my dream job in just two weeks! Highly recommend.",
        rating: 5
      },
      {
        icon: "👩‍🎨",
        name: "Jane Smith",
        review: "Finding the right candidate has never been easier. The dashboard is super intuitive!",
        rating: 4
      },
      {
        icon: "👨‍💼",
        name: "Mike Johnson",
        review: "Fast and reliable hiring process. Great experience overall.",
        rating: 5
      },
      {
        icon: "👩‍💻",
        name: "Emily Davis",
        review: "Verified candidates saved me so much time. Truly a professional platform.",
        rating: 4
      }
    ].map((item, index) => (
      <div className="col-md-6 col-lg-3" key={index}>
        <div
          className="p-4 rounded-4 shadow text-center text-white"
          style={{
            background: "#1E293B",
            transition: "transform 0.3s, box-shadow 0.3s",
            cursor: "pointer",
            minHeight: "320px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
          }}
        >
          <div
            className="mb-3 d-flex align-items-center justify-content-center rounded-circle mx-auto"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "rgba(255,255,255,0.2)",
              fontSize: "36px",
            }}
          >
            {item.icon}
          </div>
          <h5 className="fw-bold mt-2" style={{ fontSize: "20px" , fontFamily: "'Ubuntu', sans-serif"}}>
            {item.name}
          </h5>
          <div className="mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ color: i < item.rating ? "#FFD700" : "#ccc", fontSize: "18px" }}>
                ★
              </span>
            ))}
          </div>

          <p
            className="mt-2"
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
              color: "rgba(255,255,255,0.9)",
               fontFamily: "'Ubuntu', sans-serif"
            }}
          >
            {item.review}
          </p>
        </div>
      </div>
    ))}
  </div>

  <div className="text-center mt-5">
    <button
      className="btn btn-outline-light px-4 py-2 fw-bold"
      style={{
        borderRadius: "12px",
        fontFamily: "'Ubuntu', sans-serif",
        borderWidth: "2px",
        borderColor: "var(--primary)",
        color: "var(--primary)",
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
      See More Reviews
    </button>
  </div>
</section>


<div className="mt-5">
<Footer/>
</div>


    </div>
  );
}

export default Home;