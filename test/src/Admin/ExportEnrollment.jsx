import React from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

// ============================================================
// 🔹 REUSABLE FUNCTION FOR AUTO-DOWNLOAD PDF
// ============================================================
export async function generateEnrollmentPDF(enrollment) {
  const bgUrl = "/Assets/enrollment_form.png";
  const bgBytes = await fetch(bgUrl).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([580, 842]);

  const bgImage = await pdfDoc.embedPng(bgBytes);
  page.drawImage(bgImage, {
    x: 0,
    y: 0,
    width: 580,
    height: 842,
  });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  const val = (data, placeholder) => (data && data !== "" ? data : placeholder);

  const computeAge = (dob) => {
    if (!dob) return "{Age}";
    const b = new Date(dob);
    const t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    const md = t.getMonth() - b.getMonth();
    if (md < 0 || (md === 0 && t.getDate() < b.getDate())) age--;
    return String(age);
  };

  const autoAge = computeAge(enrollment.dob);

  const paymentModeText = {
    "1": "Cash",
    "2": "Card",
    "3": "Gcash",
  };

  const paymentTypeText = {
    "1": "Fully Paid",
    "2": "Installment",
  };

  const courseText = enrollment.course
    ? enrollment.course.replace(
        "Bachelor of Science in Information Technology",
        "BSIT"
      )
    : "{Course}";

  const draw = (text, x, y) => {
    page.drawText(val(text, text), {
      x,
      y: y - 100,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // ============================================================
    // DRAW ALL FIELDS WITH PLACEHOLDERS
    // ============================================================
    draw(val(enrollment.schoolYear, "2025-2026"), 125, 780);
    draw(val(enrollment.semester, "{Semester}"), 365, 780);
    draw(courseText, 140, 758);
    draw(val(enrollment.yearLevel, "{YearLevel}"), 400, 760);
    draw(val(enrollment.lastName, "{LastName}"), 73, 655);
    draw(val(enrollment.firstName, "{FirstName}"), 73, 620);
    draw(val(enrollment.middleName, "{MiddleName}"), 73, 585);
    draw(val(enrollment.dob, "{DOB}"), 320, 655);
    draw(val(autoAge, "{Age}"), 320, 585);
    draw(val(enrollment.sex, "{Sex}"), 320, 620);
    draw(val(enrollment.email, "{Email}"), 205, 538);

    draw(val(enrollment.guardianLastName, "{GuardianLastName}"), 73, 470);
    draw(val(enrollment.guardianFirstName, "{GuardianFirstName}"), 73, 435);
    draw(val(enrollment.guardianMiddleName, "{GuardianMiddleName}"), 73, 400);
    draw(val(enrollment.guardianRelation, "{GuardianRelation}"), 320, 470);
    draw(val(enrollment.guardianContact, "{GuardianContact}"), 320, 435);
    draw(val(enrollment.guardianEmail, "{GuardianEmail}"), 320, 400);

    draw(val(paymentModeText[enrollment.paymentMode], "{PaymentMode}"), 73, 332);
    draw(val(enrollment.amount?.replace("₱", "PHP "), "{Amount}"), 320, 332);
    draw(val(paymentTypeText[enrollment.paymentType], "{PaymentType}"), 73, 297);
    draw(val(enrollment.paymentNo, "{PaymentNo}"), 73, 262);

  const pdfBytes = await pdfDoc.save();
  saveAs(
    new Blob([pdfBytes], { type: "application/pdf" }),
    `${val(enrollment.lastName, "LastName")}_${val(
      enrollment.firstName,
      "FirstName"
    )}.pdf`
  );
}

// ============================================================
// 🔹 DEFAULT COMPONENT (BUTTON EXPORT)
// ============================================================
export default function ExportEnrollment({ enrollment }) {
  return (
    <button onClick={() => generateEnrollmentPDF(enrollment)}>
      📄 Export Enrollment
    </button>
  );
}
