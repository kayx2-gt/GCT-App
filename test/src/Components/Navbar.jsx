import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "../Navbar.css";
import API_URL from "../config";

import ContactModal from "./ContactModal";
import EnrollFormModal from "./EnrollFormModal";
import UserModal from "./UserModal";

export default function Navbar() {
  const [isUserModal, setIsUserModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [userImage, setUserImage] = useState("/Assets/manager.png");
  const [isNavbarDown, setIsNavbarDown] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ✅ toggle hamburger menu

  const startY = useRef(null);

  useEffect(() => {
    const loadUser = () => {
      const student = JSON.parse(localStorage.getItem("student"));
      if (student?.photo) {
        setUserImage(`${API_URL}/uploads/${student.photo}`);
      } else {
        setUserImage("/Assets/manager.png");
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const toggleNavbar = () => {
    setIsNavbarDown(!isNavbarDown);
  };

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 50) setIsNavbarDown(true);  
    if (diff < -50) setIsNavbarDown(false); 
  };

  const handleTouchEnd = () => {
    startY.current = null;
  };

  return (
    <div className="navbase">
      <div
        className={`navbar ${isNavbarDown ? "navbar-down" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="nav-links">
          <div id="admin">
            <div className={`navigation-sidebar ${isMenuOpen ? "sidebar-open" : ""}`}>
              <div className="sidebar-links">
                <div><button onClick={() => alert("Open Settings")}>Settings</button></div>
                <div><button onClick={() => alert("Open Enrollment History")}>Enrollment History</button></div>
                <div><button onClick={() => alert("Open Book History")}>Book History</button></div>
              </div>
            </div>
            <button
            className={`hamburger-btn ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <img
              src="/Assets/menu-alt-svgrepo-com.svg"
              alt="Menu"
              className={`hamburger-icon ${isMenuOpen ? "rotate" : ""}`}
            />
          </button>
            <button
              onClick={() => setIsUserModal(true)}
              className="nav-link-like"
            >
              <img src={userImage} alt="User" />
            </button>
          </div>

          {/* ✅ Optional collapsible menu area */}
          <div className={`home-links ${isMenuOpen ? "show-menu" : ""}`}>
            <div>
              <span
                onClick={() => setIsEnrollOpen(true)}
                className="nav-link-like"
              >
                ENROLL OnL-GO
              </span>
            </div>
            <div>
              <NavLink to="/">ABOUT GCT</NavLink>
            </div>
            <div>
              <NavLink to="/Library">LIBRARY</NavLink>
            </div>
            <div>
              <NavLink to="/Courses">COURSES</NavLink>
            </div>
            <div>
              <span
                onClick={() => setIsModalOpen(true)}
                className="nav-link-like"
              >
                CONTACT US
              </span>
            </div>
          </div>

          <div className="logo">
            <img src="/Assets/GCT-Logo3.png" alt="Logo" />
          </div>
        </div>
      </div>

      <div
  className="arrow-container-navbar"
  style={{
    opacity: isMenuOpen ? 0 : 1,
    pointerEvents: isMenuOpen ? "none" : "auto",
    transition: "opacity 0.3s ease"
  }}
>
  <button
    className={`down-arrow ${isNavbarDown ? "arrow-up" : ""}`}
    onClick={toggleNavbar}
  >
    ▼
  </button>
</div>


      <UserModal isOpen={isUserModal} closeModal={() => setIsUserModal(false)} />
      <ContactModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
      <EnrollFormModal isOpen={isEnrollOpen} closeModal={() => setIsEnrollOpen(false)} />
    </div>
  );
}
