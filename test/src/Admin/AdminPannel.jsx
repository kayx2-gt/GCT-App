import React, { useState, useEffect } from "react";
import AdminModal from "../Components/AdminModal";
import "../LibraryInv.css";
import API_URL from "../config";

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);

  // -------------------------------
  // ADMIN LOGIN CHECK
  // -------------------------------
  useEffect(() => {
    const savedAdmin = localStorage.getItem("isAdmin");
    if (savedAdmin === "true") {
      setIsAdmin(true);
    } else {
      setIsModalOpen(true);
    }
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    const savedAdmin = localStorage.getItem("isAdmin");
    if (savedAdmin === "true") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  // -------------------------------
  // FETCH ENROLLMENTS
  // -------------------------------
  const fetchEnrollments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enrollments`);
      const data = await res.json();
      setEnrollments(data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchEnrollments();
  }, [isAdmin]);

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="libraryInv-body">
      {/* Admin Login Modal */}
      <AdminModal isOpen={isModalOpen} closeModal={closeModal} />

      {isAdmin ? (
        <>
          {/* ---------------------- */}
          {/* ADMIN NAVIGATION BAR   */}
          {/* ---------------------- */}
          <nav className="admin-navbar">
            <ul>
              <li>
                <a 
                  href="/BookInventory" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  📚 Book Inventory
                </a>
              </li>

              <li>
                <a 
                  href="/StudentUser" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  👨‍🎓 Student User
                </a>
              </li>
            </ul>

            <div id="admin">
              <button
                onClick={() => setIsModalOpen(true)}
                className="nav-link-like"
              >
                <img src="/Assets/manager.png" alt="Admin" />
              </button>
            </div>
          </nav>

          {/* ---------------------- */}
          {/* ENROLLMENT RECORDS     */}
          {/* ---------------------- */}

          <div className="libheader">
            <h1>Enrollment Records</h1>
            <img src="/Assets/GCT-Logo3.png" alt="Logo" />
          </div>

          <div className="table-wrapper">
            <table className="books-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>DOB</th>
                  <th>Sex</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Email</th>
                  <th>Guardian</th>
                  <th>Payment Mode</th>
                  <th>Payment Type</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{`${e.lastName}, ${e.firstName} ${e.middleName}`}</td>
                    <td>{e.dob}</td>
                    <td>{e.sex}</td>

                    <td>{e.course}</td>
                    <td>{e.yearLevel}</td>
                    <td>{e.semester}</td>

                    <td>{e.email}</td>

                    <td>
                      {`${e.guardianLastName}, ${e.guardianFirstName} (${e.guardianEmail})`}
                      <br />
                      📞 {e.guardianContact}
                    </td>

                    <td>
                      {e.paymentMode === "1"
                        ? "Cash"
                        : e.paymentMode === "2"
                        ? "Card"
                        : "Gcash"}
                    </td>

                    <td>
                      {e.paymentType === "1" ? "Fully Paid" : "Installment"}
                    </td>

                    <td>{e.amount}</td>
                  </tr>
                ))}

                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan="12" className="empty-msg">
                      No enrollment data submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        !isModalOpen && <p>Redirecting to login...</p>
      )}
    </div>
  );
}
