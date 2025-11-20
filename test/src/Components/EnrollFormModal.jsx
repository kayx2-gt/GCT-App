import React, { useState, useEffect } from "react";
import tuitionFees from "../Data/TuitionFees";
import API_URL from "../config";
import "../Enrollment.css";
import { generateEnrollmentPDF } from "../Admin/ExportEnrollment";

export default function EnrollFormModal({ isOpen, closeModal }) {
        const [step, setStep] = useState(1);    
      const [showWarning, setShowWarning] = useState(false);
      // Step 1 - Enrollment states
      const [lastName, setLastName] = useState("");
      const [middleName, setMiddleName] = useState("");
      const [firstName, setFirstName] = useState("");
      const [dob, setDob] = useState("");
      const [sex, setSex] = useState("");
      const [selectedCourse, setSelectedCourse] = useState("");
      const [selectedYear, setSelectedYear] = useState("");
      const [selectedSemester, setSelectedSemester] = useState("");
      const [email, setEmail] = useState("");
  
      // Step 2 - Guardian states
      const [pLastName, setPLastName] = useState("");
      const [pMiddleName, setPMiddleName] = useState("");
      const [pFirstName, setPFirstName] = useState("");
      const [pEmail, setPEmail] = useState("");
      const [contact, setContact] = useState("");
      const [pRelation, setPRelation] = useState("");
  
      // Step 3 - Payment states
      const [selectedPayment, setSelectedPayment] = useState("");
      const [paymentNo, setPaymentNo] = useState("");
      const [amount, setAmount] = useState("");
      const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
      
  
      
  
        useEffect(() => {
          if (selectedPayment === "1" && selectedCourse && selectedYear && selectedSemester) {
            const fees = tuitionFees[selectedCourse][selectedSemester][selectedYear];
            setAmount(fees.total.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })); // auto-fill with tuition fee
          } else {
            setAmount(""); // clear if not cash
          }
        }, [selectedPayment, selectedCourse, selectedYear, selectedSemester]);

        if (!isOpen) return null;
  
        const handleSubmit = async (e) => {
        e.preventDefault();
  
        const data = {
          lastName, middleName, firstName, dob, sex,
          selectedCourse, selectedYear, selectedSemester, email,
          pLastName, pMiddleName, pFirstName, pEmail, pRelation, contact,
          selectedPaymentMode, selectedPayment, paymentNo, amount
        };
  
        try {
          const response = await fetch(`${API_URL}/api/enroll`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
  
          if (!response.ok) {
          throw new Error("Failed to submit enrollment");
        }

        const result = await response.json();
        alert(result.message);

        // =======================
        // 🔹 AUTO-DOWNLOAD PDF HERE
        // =======================

        await generateEnrollmentPDF({
          lastName,
          middleName,
          firstName,
          dob,
          sex,
          course: selectedCourse,
          yearLevel: selectedYear,
          semester: selectedSemester,
          email,
          guardianLastName: pLastName,
          guardianMiddleName: pMiddleName,
          guardianFirstName: pFirstName,
          guardianEmail: pEmail,
          guardianRelation: pRelation,
          guardianContact: contact,
          paymentMode: selectedPaymentMode,
          paymentType: selectedPayment,
          paymentNo,
          amount,
        });

        // then close the form
        closeModal();
        } catch (error) {
          console.error(error);
          alert("Error submitting enrollment");
        }
        closeModal();
      };
  
        
        const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
        const handleNextStep = () => {
          if (step === 1) {
            if (
              !lastName.trim() ||
              !middleName.trim() ||
              !firstName.trim() ||
              !dob.trim() ||
              !sex.trim() ||
              !email.trim() ||
              !selectedCourse ||
              !selectedYear ||
              !selectedSemester
            ) {
              return;
            }
          }
  
          if (step === 2) {
            if (
              !pLastName.trim() ||
              !pMiddleName.trim() ||
              !pFirstName.trim() ||
              !pEmail.trim() ||
              !contact.trim() ||
              !pRelation.trim()
            ) {
              return;
            }
          }
  
          setStep((prev) => Math.min(prev + 1, 3)); // only move if valid
        };
  
        const formatAmount = (amount) => {
          if (amount < 0) return "Invalid amount";
          return `₱${amount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        };
  
        return (
            <div className="form-container">
            <form onSubmit={handleSubmit}>
            <span className="close-btn" onClick={() => setShowWarning(true)}>
              &times;
            </span>
            {/* Progress Bar */}
            <div className="progress-bar">
              <div className={`step ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
                {step > 1 ? <span className="check">✓</span> : "1"}
              </div>
              <div className={`line ${step > 1 ? "completed" : ""}`}></div>
  
              <div className={`step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
                {step > 2 ? <span className="check">✓</span> : "2"}
              </div>
              <div className={`line ${step > 2 ? "completed" : ""}`}></div>
  
              <div className={`step ${step === 3 ? "active" : ""}`}>
                {step > 3 ? <span className="check">✓</span> : "3"}
              </div>
            </div>
  
            {/* Warning modal */}
            {showWarning && (
              <div className="warning-overlay">
                <div className="warning-box">
                  <p>Are you sure you want to close the form? <br/><br/>Unsaved data will be lost.</p>
                  <div className="warning-actions">
                    <button
                      onClick={() => {
                        closeModal();
                        setShowWarning(false);
                      }}
                    >
                      Okay
                    </button>
                    <button onClick={() => setShowWarning(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
  
            {/* Step 1 */}
            {step === 1 && (
              <>
                <h1>Enrollment Form</h1>
  
                <label>Last Name:</label>
                <input
                  type="text"
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  required
                />
  
                <label>Middle Name:</label>
                <input
                  type="text"
                  placeholder="Aquino"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  required
                />
  
                <label>First Name:</label>
                <input
                  type="text"
                  placeholder="Juan Miguel"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  required
                />
  
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
  
                <label>Sex:</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} required>
                  <option value="" disabled hidden>Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
  
                <label>Course:</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select Course</option>
                  <option value="BS in Computer Science">BSComsci</option>
                  <option value="BS in Information Technology">BSIT</option>
                  <option value="BS in Civil Engineering">BSCE</option>
                  <option value="BS in Electrical Engineering">BSEE</option>
                  <option value="BS in Accountancy">BSA</option>
                  <option value="BS in Business Administration">BSBA</option>
                  <option value="BS in Hotel Management">BSHM</option>
                  <option value="BS in Office Administration">BSOA</option>
                </select>
  
                <label>Year level:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
  
                <label>Semester:</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select Semester</option>
                  <option value="firstSemester">1st Semester</option>
                  <option value="secondSemester">2nd Semester</option>
                </select>
  
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
  
                <div className="form-nav">
                  <button type="submit" onClick={handleNextStep}>
                    Next →
                  </button>
                </div>
                
  
                {selectedCourse && selectedYear && selectedSemester && (
                  <div className="tuition-details">
                      <h3>{selectedCourse} - Year {selectedYear} ({selectedSemester})</h3>
                      <div className="fee-row">
                      <span>General Fee:</span>
                      <span>₱{tuitionFees[selectedCourse][selectedSemester][selectedYear].general.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="fee-row">
                      <span>Tuition Fee:</span>
                      <span>₱{tuitionFees[selectedCourse][selectedSemester][selectedYear].tuition.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="fee-row total">
                      <span>Total:</span>
                      <span>₱{tuitionFees[selectedCourse][selectedSemester][selectedYear].total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                  </div>
                  )}
              </>
              
            )}
  
            {/* Step 2 */}
            {step === 2 && (
              <>
                <h1>Guardian / Emergency Contact</h1>
  
                <label>Last Name:</label>
                <input
                  type="text"
                  placeholder="Dela Cruz"
                  value={pLastName}
                  onChange={(e) => setPLastName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  required
                />
  
                <label>Middle Name:</label>
                <input
                  type="text"
                  placeholder="Aquino"
                  value={pMiddleName}
                  onChange={(e) => setPMiddleName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  required
                />
  
                <label>First Name:</label>
                <input
                  type="text"
                  placeholder="Maria"
                  value={pFirstName}
                  onChange={(e) => setPFirstName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  required
                />

                <label>Relationship to Student:</label>
                <select
                  value={pRelation}
                  onChange={(e) => setPRelation(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
  
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  required
                />
  
                <label>Contact No.:</label>
                <input
                  type="text"
                  placeholder="CP No. or Landline"
                  value={contact}
                  onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
                  required
                />
  
                <div className="form-nav">
                  <button type="button" onClick={prevStep}>← Back</button>
                  <button type="submit" onClick={handleNextStep}>Next →</button>
                </div>
              </>
            )}
  
            {/* Step 3 */}
            {step === 3 && (
              <>
                <h1>Payment Method</h1>
  
                <label>Mode of payment:</label>
                <select
                  value={selectedPaymentMode}
                  onChange={(e) => setSelectedPaymentMode(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select payment</option>
                  <option value="1">Cash</option>
                  <option value="2">Card</option>
                  <option value="3">Gcash</option>
                </select>
  
                {(selectedPaymentMode === "2" || selectedPaymentMode === "3") && (
                  <>
                    <input
                      type="text"
                      placeholder={selectedPaymentMode === "2" ? "Enter Card No." : "Enter Gcash No."}
                      value={paymentNo}
                      onChange={(e) => setPaymentNo(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </>
                )}
                <label>Payment</label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select payment</option>
                  <option value="1">Fully Paid</option>
                  <option value="2">Installment</option>
                </select>
  
                <label>Amount:</label>
                <input
                  type="text"
                  placeholder="₱ 0.00"
                  value={amount ? "₱ " + amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                  onChange={(e) => {
                    // keep only digits
                    let rawValue = e.target.value.replace(/[^\d]/g, "");
                    setAmount(rawValue);
                  }}
  
                  required
                  readOnly={selectedPayment === "1"}
                />
  
                <div className="form-nav">
                  <button type="button" onClick={prevStep}>← Back</button>
                  <button type="submit">Submit</button>
                </div>
  
                {selectedCourse && selectedYear && selectedSemester && (
                  <div className="tuition-details">
                      <h3>{selectedCourse} - Year {selectedYear} ({selectedSemester})</h3>
                      <div className="fee-row">
                      <span>General Fee:</span>
                      <span>₱{tuitionFees[selectedCourse][selectedSemester][selectedYear].general.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="fee-row">
                      <span>Tuition Fee:</span>
                      <span>₱{tuitionFees[selectedCourse][selectedSemester][selectedYear].tuition.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="fee-row total">
                      <span>Total:</span>
                      <span>₱{tuitionFees[selectedCourse][selectedSemester][selectedYear].total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                  </div>
                  )}
  
                  {/* Installment breakdown */}
                  {selectedPayment === "2" && (
                    (() => {
                      const total = tuitionFees[selectedCourse][selectedSemester][selectedYear].total;
                      const downPaymentNumber = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0; // clean input
                      const remaining = total - downPaymentNumber;
                      const prelim = remaining * 0.5;
                      const remainingAfterPrelim = remaining - prelim;
                      const perTerm = remainingAfterPrelim / 3;
  
                      return (
                        <div className="tuition-details">
                          <h3>Installment Breakdown</h3>
                          <div className="fee-row ">
                            <span>Down Payment:</span>
                            <span>{formatAmount(downPaymentNumber)}</span>
                          </div>
                          <div className="fee-row total">
                            <span>Prelim:</span>
                            <span>{formatAmount(prelim)}</span>
                            </div>
                          <div className="fee-row total">
                            <span>Midterm:</span>
                            <span>{formatAmount(perTerm)}</span>
                            </div>
                          <div className="fee-row total">
                            <span>Prefinal:</span>
                            <span>{formatAmount(perTerm)}</span>
                            </div>
                          <div className="fee-row total">
                            <span>Finals:</span>
                            <span>{formatAmount(perTerm)}</span>
                          </div>
                        </div>
                      );
                    })()
                  )}
              </>
            )}
          </form></div>
      );
}
