const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;
const ip = require("ip");

app.use(cors());
app.use(bodyParser.json());

// Start server
app.listen(3001, "0.0.0.0", () => {
  console.log(`✅ Server running at:`);
  console.log(`   Local:   http://localhost:3001`);
  console.log(`   Network: http://${ip.address()}:3001`);
});

app.use(
  cors({
    origin: [
      "http://localhost:3000", // React frontend
      "http://127.0.0.1:5500", // Live Server
      "http://localhost:5500",
    ],
  })
);
app.use(express.json());

// =================== ENROLLMENTS DB ===================
const db = new sqlite3.Database("ngilo.db", (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the ngilo.db database.");
  }
});

db.run(
  `
  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    lastName TEXT,
    middleName TEXT,
    firstName TEXT,
    dob TEXT,
    sex TEXT,
    course TEXT,
    yearLevel TEXT,
    semester TEXT,
    email TEXT,
    guardianLastName TEXT,
    guardianMiddleName TEXT,
    guardianFirstName TEXT,
    guardianEmail TEXT,
    guardianRelation TEXT,
    guardianContact TEXT,
    paymentMode TEXT,
    paymentType TEXT,
    paymentNo TEXT,
    amount TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) console.error("Error creating enrollments table:", err.message);
  }
);

// API: Save enrollment
app.post("/api/enroll", (req, res) => {
  const {
    lastName,
    middleName,
    firstName,
    dob,
    sex,
    selectedCourse,
    selectedYear,
    selectedSemester,
    email,
    pLastName,
    pMiddleName,
    pFirstName,
    pEmail,
    pRelation,
    contact,
    selectedPaymentMode,
    selectedPayment,
    paymentNo,
    amount,
  } = req.body;

  if (
    !lastName ||
    !firstName ||
    !dob ||
    !sex ||
    !selectedCourse ||
    !selectedYear ||
    !selectedSemester ||
    !email
  ) {
    return res.status(400).send("Missing required fields.");
  }

  const id = uuidv4();

  db.run(
  `INSERT INTO enrollments (
      id, lastName, middleName, firstName, dob, sex,
      course, yearLevel, semester, email,
      guardianLastName, guardianMiddleName, guardianFirstName, guardianEmail, guardianRelation, guardianContact,
      paymentMode, paymentType, paymentNo, amount
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  [
      id,
      lastName,
      middleName,
      firstName,
      dob,
      sex,
      selectedCourse,
      selectedYear,
      selectedSemester,
      email,
      pLastName,
      pMiddleName,
      pFirstName,
      pEmail,
      pRelation,  
      contact,     
      selectedPaymentMode,
      selectedPayment,
      paymentNo,
      amount
  ],
    (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Error saving enrollment.");
      }
      res.status(200).json({ id, message: "Enrollment saved successfully!" });
    }
  );
});

// API: Get enrollments
app.get("/api/enrollments", (req, res) => {
  db.all("SELECT * FROM enrollments ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error fetching enrollments.");
    }
    res.status(200).json(rows);
  });
});

// ====================== Library Database ======================
const librarydb = new sqlite3.Database("library.db", (err) => {
  if (err) console.error("Error connecting to library.db:", err.message);
  else console.log("Connected to library.db");
});

// Create books table
librarydb.run(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publication_date DATE NOT NULL,
    description TEXT,
    quantity_in_stock INTEGER DEFAULT 1,
    cover_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Serve uploaded images
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads folder");
}
app.use("/uploads", express.static(uploadsDir));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Get all books
app.get("/api/books", (req, res) => {
  librarydb.all("SELECT * FROM books ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a new book
app.post("/api/books", upload.single("cover"), (req, res) => {
  const { title, author, publication_date, description, quantity } = req.body;
  const cover = req.file ? req.file.filename : null;

  if (!title || !author || !publication_date) {
    return res
      .status(400)
      .json({ error: "Title, author, and publication date are required." });
  }

  const qty = parseInt(quantity, 10) || 1;

  const sql = `
    INSERT INTO books (title, author, publication_date, description, quantity_in_stock, cover_image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  librarydb.run(
    sql,
    [title, author, publication_date, description, qty, cover],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: this.lastID,
        title,
        author,
        publication_date,
        description,
        quantity_in_stock: qty,
        cover_image: cover,
      });
    }
  );
});

// Delete a book
app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;

  // Step 1: Find the cover image filename
  librarydb.get("SELECT cover_image FROM books WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching cover image:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Book not found" });
    }

    const coverImage = row.cover_image;
    let fileDeleted = false;
    let fileError = null;

    // Step 2: Delete the image file if it exists
    if (coverImage) {
      const filePath = path.join(uploadsDir, coverImage);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          if (unlinkErr.code !== "ENOENT") {
            console.error("❌ Error deleting file:", unlinkErr.message);
            fileError = unlinkErr.message;
          }
        } else {
          console.log(`✅ Deleted file: ${filePath}`);
          fileDeleted = true;
        }

        // Step 3: Delete the DB row after file attempt
        librarydb.run("DELETE FROM books WHERE id = ?", [id], function (err) {
          if (err) {
            console.error("Error deleting book:", err.message);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            success: true,
            dbDeleted: true,
            fileDeleted,
            fileError,
          });
        });
      });
    } else {
      // No cover image, just delete from DB
      librarydb.run("DELETE FROM books WHERE id = ?", [id], function (err) {
        if (err) {
          console.error("Error deleting book:", err.message);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          success: true,
          dbDeleted: true,
          fileDeleted: false,
          message: "Book deleted but no cover image was found",
        });
      });
    }
  });
});

app.get("/api/debug/books", (req, res) => {
  librarydb.all("SELECT id, title, cover_image FROM books", [], (err, rows) => {
    if (err) {
      console.error("Error fetching books:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ====================== Borrowed Books Database ======================
const borroweddb = librarydb;

// Create borrowed_books table
borroweddb.run(`
  CREATE TABLE IF NOT EXISTS borrowed_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    book_id INTEGER,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP,
    status TEXT DEFAULT 'Borrowed'
  )
`);

app.post("/api/borrow/:id", (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body; // Student ID from frontend

  // Step 1: Check if book exists and has available stock
  librarydb.get(
    "SELECT quantity_in_stock FROM books WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        console.error("Error checking book:", err.message);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      if (row.quantity_in_stock <= 0) {
        return res.json({ success: false, message: "Out of stock" });
      }

      // Step 2: Deduct one stock from the book
      librarydb.run(
        "UPDATE books SET quantity_in_stock = quantity_in_stock - 1 WHERE id = ?",
        [id],
        function (updateErr) {
          if (updateErr) {
            console.error("Error updating stock:", updateErr.message);
            return res.status(500).json({ success: false, error: "Failed to update stock" });
          }

          // Step 3: Log the borrowed book in borrowed.db
          borroweddb.run(
            "INSERT INTO borrowed_books (student_id, book_id) VALUES (?, ?)",
            [studentId || null, id],
            (logErr) => {
              if (logErr) {
                console.error("Error logging borrowed book:", logErr.message);
                return res.status(500).json({ success: false, error: "Failed to log borrowed book" });
              }

              console.log(`Book ID ${id} borrowed successfully.`);
              res.json({ success: true, message: "Book borrowed successfully!" });
            }
          );
        }
      );
    }
  );
});

app.get("/api/borrow/history/:studentId", (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT 
      br.id,
      br.book_id,                
      bk.title AS book_title,
      bk.cover_image AS cover_image,  -- ✅ Added this line
      br.borrow_date,
      datetime(br.borrow_date, '+7 days') AS due_date,
      br.return_date,
      br.status
    FROM borrowed_books br
    LEFT JOIN books bk ON br.book_id = bk.id
    WHERE br.student_id = ?
    ORDER BY br.borrow_date DESC
  `;

  borroweddb.all(query, [studentId], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching borrow history:", err.message);
      return res.json([]); // Always return an array even on error
    }

    if (!rows || !Array.isArray(rows)) {
      console.warn("⚠ No borrow history or invalid data format");
      return res.json([]);
    }

    res.json(rows);
  });
});


// ✅ Return a borrowed book
app.post("/api/borrow/return/:recordId", (req, res) => {
  const { recordId } = req.params;
  const { bookId } = req.body;

  console.log("📦 Return request received:", { recordId, bookId });

  // 🧩 Validate input
  if (!recordId || !bookId) {
    console.warn("⚠️ Missing data for return:", { recordId, bookId });
    return res
      .status(400)
      .json({ success: false, message: "Missing recordId or bookId" });
  }

  // 🧠 Step 1: Update borrow record to 'Returned'
  borroweddb.run(
    "UPDATE borrowed_books SET status = 'Returned', return_date = CURRENT_TIMESTAMP WHERE id = ?",
    [recordId],
    function (err) {
      if (err) {
        console.error("❌ Error updating borrow record:", err.message);
        return res
          .status(500)
          .json({ success: false, message: "Failed to update borrow record" });
      }

      if (this.changes === 0) {
        console.warn("⚠️ No borrow record found with that ID");
        return res.json({ success: false, message: "No record updated" });
      }

      console.log(`✅ Borrow record ${recordId} marked as returned.`);

      // 🧠 Step 2: Increment the book stock
      librarydb.run(
        "UPDATE books SET quantity_in_stock = quantity_in_stock + 1 WHERE id = ?",
        [bookId],
        (bookErr) => {
          if (bookErr) {
            console.error("❌ Error updating book stock:", bookErr.message);
            return res
              .status(500)
              .json({ success: false, message: "Failed to update book stock" });
          }

          console.log(`📚 Book ID ${bookId} stock incremented.`);

          // 🧠 Step 3: Fetch the updated record for frontend update
          borroweddb.get(
            "SELECT * FROM borrowed_books WHERE id = ?",
            [recordId],
            (fetchErr, updatedRecord) => {
              if (fetchErr) {
                console.error(
                  "❌ Error fetching updated borrow record:",
                  fetchErr.message
                );
                return res.status(500).json({
                  success: false,
                  message: "Failed to fetch updated borrow record",
                });
              }

              console.log("🔁 Updated record returned to frontend:", updatedRecord);
              res.json({ success: true, updatedRecord });
            }
          );
        }
      );
    }
  );
});

// 📬 Student requests to borrow a book
app.post("/api/borrow/request/:bookId", (req, res) => {
  const { bookId } = req.params;
  const { studentId } = req.body;

  if (!bookId || !studentId) {
    console.log("⚠️ Missing borrow request data:", { bookId, studentId });
    return res.json({ success: false, message: "Missing data." });
  }

  // ✅ Only block active or violated books (not denied)
  const checkQuery = `
    SELECT COUNT(*) AS active_borrows
    FROM borrowed_books
    WHERE student_id = ?
      AND status IN ('Borrowed', 'Pending Approval', 'Violated')
  `;

  borroweddb.get(checkQuery, [studentId], (err, result) => {
    if (err) {
      console.error("Error checking borrow status:", err.message);
      return res.json({ success: false, message: "Server error occurred." });
    }

    if (result.active_borrows > 0) {
      console.log("🚫 Borrow blocked for student:", studentId);
      return res.json({
        success: false,
        message:
          "Not approved due to unreturned or violated books. Please visit the Library Admin to verify or resolve the issue.",
      });
    }

    // ✅ Allow request if no active/violated books
    const insertQuery = `
      INSERT INTO borrowed_books (book_id, student_id, borrow_date, status)
      VALUES (?, ?, datetime('now'), 'Pending Approval')
    `;

    borroweddb.run(insertQuery, [bookId, studentId], (insertErr) => {
      if (insertErr) {
        console.error("Error inserting borrow request:", insertErr.message);
        return res.json({ success: false, message: "Failed to request borrow." });
      }

      console.log(`📗 Borrow request added for student ${studentId}, book ${bookId}`);
      return res.json({ success: true, message: "Borrow request sent successfully!" });
    });
  });
});

// ✅ Update borrow status (Approve, Deny, etc.)
// ✅ Update borrow status (Approve, Deny, etc.)
app.post("/api/borrow/update-status/:recordId", (req, res) => {
  const { recordId } = req.params;
  const { status } = req.body;

  const getRecordQuery = "SELECT * FROM borrowed_books WHERE id = ?";
  borroweddb.get(getRecordQuery, [recordId], (err, record) => {
    if (err || !record) {
      console.error("Error finding record:", err);
      return res.json({ success: false, message: "Record not found." });
    }

    const updateQuery = `
      UPDATE borrowed_books 
      SET status = ?, 
          return_date = CASE WHEN ? = 'Returned' THEN CURRENT_TIMESTAMP ELSE return_date END
      WHERE id = ?
    `;

    borroweddb.run(updateQuery, [status, status, recordId], function (updateErr) {
      if (updateErr) {
        console.error("Error updating status:", updateErr);
        return res.json({ success: false, message: "Failed to update status." });
      }

      // 🟢 Update stock based on status
      if (status === "Returned") {
        // Book returned → increase stock
        librarydb.run(
          "UPDATE books SET quantity_in_stock = quantity_in_stock + 1 WHERE id = ?",
          [record.book_id],
          (stockErr) => {
            if (stockErr) console.error("Error incrementing stock:", stockErr);
          }
        );
      } else if (status === "Approved" || status === "Borrowed") {
        // Book approved/borrowed → decrease stock
        librarydb.run(
          "UPDATE books SET quantity_in_stock = quantity_in_stock - 1 WHERE id = ? AND quantity_in_stock > 0",
          [record.book_id],
          (stockErr) => {
            if (stockErr) console.error("Error decreasing stock:", stockErr);
          }
        );
      }

      const updatedRecord = { ...record, status };
      res.json({ success: true, updatedRecord });
    });
  });
});


// ===============================
// AdminAccount
// ===============================
const admindb = new sqlite3.Database("admin.db", (err) => {
  if (err) {
    console.error("❌ Error connecting to the database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

admindb.serialize(() => {
  // Create table first
  admindb.run(
    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`,
    (err) => {
      if (err) console.error("❌ Error creating admins table:", err.message);
      else console.log("✅ Admins table ready.");
    }
  );

  // Insert default admin after table creation
  const defaultPassword = bcrypt.hashSync("12345", 10);
  admindb.run(
    `INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', ?)`,
    [defaultPassword],
    (err) => {
      if (err) console.error("❌ Error inserting default admin:", err.message);
      else console.log("✅ Default admin ensured.");
    }
  );
});

// ✅ Localhost-only middleware
const allowedIps = ["::1", "127.0.0.1"];
app.use((req, res, next) => {
  if (
    (req.path.startsWith("/api/admin") || req.path.startsWith("/api/bookinventory")) &&
    !allowedIps.includes(req.ip)
  ) {
    return res.status(403).json({ error: "❌ Forbidden: Localhost only" });
  }
  next();
});

// 🔹 Login Route
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM admins WHERE username = ?`;
admindb.get(sql, [username], (err, row) => {
  if (err) return res.status(500).json({ error: err.message });

  if (row && bcrypt.compareSync(password, row.password)) {
    res.json({ success: true, message: "✅ Login successful!" });
  } else {
    res.json({ success: false, message: "❌ Invalid username or password" });
  }
});
});

// 🔹 Change Password Route
app.post("/api/admin/change-password", (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const sql = `UPDATE admins SET password = ? WHERE username = ?`;
  admindb.run(sql, [hashedPassword, username], function (err){
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "✅ Password updated successfully!" });
  });
});

// ===============================
// Student Accounts (with login)
// ===============================
const userdb = new sqlite3.Database("user.db", (err) => {
  if (err) {
    console.error("❌ Error connecting to the user database:", err.message);
  } else {
    console.log("✅ Connected to User SQLite database.");
  }
});

userdb.run(
  `CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    fullname TEXT,
    libraryCardNo TEXT,
    studentNo TEXT,
    courseYear TEXT,
    photo TEXT,
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'inactive'))
  )`,
  (err) => {
    if (err) {
      console.error("❌ Error creating students table:", err.message);
    } else {
      console.log("✅ Students table ready.");
    }
  }
);


// 🔹 Student Login Route
app.post("/api/student/login", (req, res) => {
  const { username, password } = req.body;

  userdb.get(
    "SELECT * FROM students WHERE username = ? AND password = ?",
    [username, password],
    (err, student) => {
      if (err) {
        console.error("❌ DB error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!student) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // 🚨 Check if inactive
      if (student.status && student.status.toLowerCase() === "inactive") {
        return res.status(403).json({
          error: "Your account is inactive. Please contact admin.",
        });
      }

      // ✅ Success
      res.json({
        success: true,
        message: "Login successful",
        student: {
          id: student.id,
          username: student.username,
          fullname: student.fullname,
          status: student.status,
          photo: student.photo || null
        },
      });
    }
  );
});

// 📋 Get single student by ID
app.get("/api/students/:id", (req, res) => {
  const { id } = req.params;

  userdb.get(`SELECT * FROM students WHERE id = ?`, [id], (err, student) => {
    if (err) {
      console.error("❌ Error fetching student:", err.message);
      return res.status(500).json({ error: "Server error" });
    }

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  });
});

// 📋 Get all students
app.get("/api/students", (req, res) => {
  userdb.all(`SELECT * FROM students`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;

  // 1. Get the student's photo filename
  userdb.get(`SELECT photo FROM students WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row && row.photo) {
      const photoPath = path.join("./uploads", row.photo);

      // 2. Delete the photo file if it exists
      fs.unlink(photoPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("❌ Error deleting photo:", err.message);
        } else {
          console.log("🗑️ Photo deleted:", photoPath);
        }
      });
    }

    // 3. Delete student from database
    userdb.run(`DELETE FROM students WHERE id = ?`, [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ success: true, deleted: this.changes });
    });
  });
});

// storage for student photos
const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, "student_" + Date.now() + path.extname(file.originalname));
  },
});

const uploadStudentPhoto = multer({ storage: studentStorage });

// add student
app.post("/api/students/add", uploadStudentPhoto.single("photo"), (req, res) => {
  const { username, password, fullname, libraryCardNo, studentNo, courseYear } = req.body;
  const photo = req.file ? req.file.filename : null;

  userdb.run(
    `INSERT INTO students (username, password, fullname, libraryCardNo, studentNo, courseYear, photo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, password, fullname, libraryCardNo, studentNo, courseYear, photo],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // 🔹 Return full student object instead of just the ID
      res.json({
        success: true,
        id: this.lastID,
        username,
        password,       // ⚠️ careful with exposing raw password in production
        fullname,
        libraryCardNo,
        studentNo,
        courseYear,
        photo
      });
    }
  );
});

// ✅ Update student status (active/inactive)
app.put("/api/students/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate input
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  userdb.run(
    "UPDATE students SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        console.error("❌ Error updating status:", err);
        return res.status(500).json({ error: "Failed to update status" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({ success: true, id, status });
    }
  );
});

// Login check
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [user] = await db.query("SELECT * FROM students WHERE email = ?", [email]);

  if (!user) return res.status(401).json({ message: "User not found" });
  if (user.status === "inactive") return res.status(403).json({ message: "Account inactive" });

  // continue login (check password, issue token, etc.)
});



