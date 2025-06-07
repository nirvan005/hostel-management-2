// const oracledb=require('oracledb');
const mysql2 = require("mysql2");
const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const PORT = 4000;
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const admin_key = process.env.ADMIN_KEY;
const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cors());
app.use(express.json());
db.connect((err) => {
  if (err) {
    console.log("Couldn't connect to MySQL");
    process.exit(0);
  }
  console.log("Connected to MySQL");
});

app.post("/signup-admin", (req, res) => {
  const { username, password, email, name, phone, adminKey } = req.body;
  if (adminKey !== admin_key) {
    return res.status(403).json({ error: "Invalid admin key" });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: "Password hashing failed" });
    }
    db.query(
      "INSERT INTO Users (username, password, email, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hash, email, name, phone, "admin"],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database insertion failed" });
        }
        res.status(201).json({
          message: "Admin created successfully",
          userId: results.insertId,
        });
      }
    );
  });
});

app.post("/login-admin", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM Users WHERE username=? AND role='admin'",
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const user = results[0];
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return res.status(500).json({ error: "Password comparison failed" });
        }
        if (!match) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        res.status(200).json({
          message: "Login successful",
          userId: user.user_id,
          name: user.name,
        });
      });
    }
  );
});

app.post("/signup-student", (req, res) => {
  const { username, password, email, name, phone } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: "Password hashing failed" });
    }
    db.query(
      "INSERT INTO Users (username, password, email, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hash, email, name, phone, "student"],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database insertion failed" });
        }
        res.status(201).json({
          message: "Student created successfully",
          userId: results.insertId,
        });
      }
    );
  });
});

app.post("/login-student", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM Users WHERE username=? AND role='student'",
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const user = results[0];
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return res.status(500).json({ error: "Password comparison failed" });
        }
        if (!match) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        res.status(200).json({
          message: "Login successful",
          userId: user.user_id,
          name: user.name,
        });
      });
    }
  );
});

app.post("/room-request", (req, res) => {
  const {
    user_id,
    address,
    fathers_name,
    mothers_name,
    parent_phone,
    preferred_room,
  } = req.body;

  db.query(
    "SELECT allocation_id FROM Student WHERE student_id = ?",
    [user_id],
    (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching allocation ID");
      }
      if (results.length !== 0) {
        return res.status(401).send("You already have a room assigned");
      } else {
        db.query(
          "INSERT INTO requests (user_id, address, fathers_name, mothers_name, parent_phone, requested_room_id,type) values(?,?,?,?,?,?,?)",
          [
            user_id,
            address,
            fathers_name,
            mothers_name,
            parent_phone,
            preferred_room,
            "new",
          ],
          (err, results) => {
            if (err) {
              return res.status(500).send("Error inserting room request");
            }
            res.send("Room request submitted successfully");
          }
        );
      }
    }
  );
});

app.post("/change-room-request", (req, res) => {
  const { user_id, preferred_room } = req.body;

  db.query(
    "SELECT * FROM Rooms WHERE room_no = ?",
    [preferred_room],
    (err, roomResults) => {
      if (err) {
        return res.status(500).send("Error fetching room details");
      }
      if (roomResults.length === 0) {
        return res.status(404).send("Room not found");
      }
      // Proceed with changing the room
      db.query(
        "SELECT * FROM Student WHERE student_id = ?",
        [user_id],
        (err, studentResults) => {
          if (err) {
            return res.status(500).send("Error fetching student details");
          }
          if (studentResults.length === 0) {
            return res.status(404).send("No room assigned to this student");
          }
          db.query(
            "INSERT INTO requests (user_id, address, fathers_name, mothers_name, parent_phone, requested_room_id,type) values(?,?,?,?,?,?,?)",
            [
              user_id,
              studentResults[0].address,
              studentResults[0].fathers_name,
              studentResults[0].mothers_name,
              studentResults[0].parent_phone,
              preferred_room,
              "change",
            ],
            (err) => {
              if (err) {
                return res
                  .status(500)
                  .send("Error submitting room change request");
              }
              res.send("Room change request submitted successfully");
            }
          );
        }
      );
    }
  );
});

app
  .get("/student", (req, res) => {
    db.query(
      "SELECT * FROM Student S INNER JOIN Users U ON S.student_id=U.user_id INNER JOIN Rooms R ON S.room_id=R.room_id WHERE S.end_date IS NULL",
      (err, results) => {
        res.send(results);
      }
    );
  })
  .get("/student/:room_no", (req, res) => {
    const { room_no } = req.params;
    db.query(
      "SELECT * FROM Student S INNER JOIN Users U ON S.student_id=U.user_id INNER JOIN Rooms R ON S.room_id=R.room_id WHERE R.room_no=? AND S.end_date IS NULL",
      [room_no],
      (err, results) => {
        res.send(results);
      }
    );
  });

app.get("/admin", (req, res) => {
  if (!req.query.admin_id) {
    db.query(
      "SELECT * FROM Admin A INNER JOIN Users U ON A.admin_id=U.user_id",
      (err, results) => {
        res.send(results);
      }
    );
  } else {
    db.query(
      "SELECT * FROM Admin A INNER JOIN Users U ON A.admin_id=U.user_id WHERE A.admin_id=?",
      req.query.admin_id,
      (err, results) => {
        res.send(results);
      }
    );
  }
});

app.get("/rooms", (req, res) => {
  if (!req.query.room_id) {
    db.query("SELECT * FROM Rooms", (err, results) => {
      res.send(results);
    });
  } else {
    db.query(
      "SELECT * FROM Rooms R WHERE R.room_id=?",
      req.query.room_id,
      (err, results) => {
        res.send(results);
      }
    );
  }
});

app.get("/checkinout", (req, res) => {
  if (!req.query.student_id) {
    db.query(
      "SELECT * FROM CheckIn_CheckOut C INNER JOIN Student S ON C.student_id=S.student_id",
      (err, results) => {
        res.send(results);
      }
    );
  } else {
    db.query(
      "SELECT * FROM CheckIn_CheckOut C INNER JOIN Student S ON C.student_id=S.student_id WHERE C.student_id=?",
      req.query.student_id,
      (err, results) => {
        res.send(results);
      }
    );
  }
});

app.get("/floors", (req, res) => {
  db.query(
    "SELECT DISTINCT floor_no,room_no,status FROM Rooms ORDER BY floor_no",
    (err, results) => {
      res.send(results);
    }
  );
});

app.post("/add-student", (req, res) => {
  const { name, username, password, phone, email } = req.body;
  db.query(
    "INSERT INTO Users(name,username,password,phone,email) values(?,?,?,?,?)",
    [name, username, password, phone, email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database insertion failed" });
      }

      res.status(201).json({
        message: "Student added successfully",
        userId: results.insertId,
      });
    }
  );
});

app.get("/unassigned-students", (req, res) => {
  const sql = `
    SELECT user_id, name, username,requested_room_id
    FROM requests natural join Users
    WHERE type='new' AND status='pending' AND requested_room_id IS NULL
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get("/assigned-students", (req, res) => {
  const sql = `
    SELECT user_id, name, username
    FROM Users
    WHERE user_id IN (SELECT student_id FROM Student WHERE end_date IS NULL)
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/assign-room", (req, res) => {
  const {
    student_id,
    address,
    fathers_name,
    mothers_name,
    parent_phone,
    room_no,
    start_date,
    end_date,
  } = req.body;
  const getNextId = "SELECT MAX(allocation_id) AS maxId FROM Student";
  db.query(getNextId, (err, result) => {
    if (err) return res.status(500).send("Error getting allocation ID");

    const nextId = (result[0].maxId || 0) + 1;

    const findRoomIdQuery = "SELECT room_id FROM Rooms WHERE room_no = ?";
    db.query(findRoomIdQuery, [room_no], (err, roomResults) => {
      if (err) {
        return res.status(500).send("Error fetching room ID");
      }
      if (roomResults.length === 0)
        return res.status(404).send("Room not found");

      const room_id = roomResults[0].room_id;
      const insertStudentQuery = `
      INSERT INTO Student (student_id, address, fathers_name, mothers_name, allocation_id, parent_phone, room_id, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      db.query(
        insertStudentQuery,
        [
          student_id,
          address,
          fathers_name,
          mothers_name,
          nextId,
          parent_phone,
          room_id,
          start_date,
          end_date,
        ],
        (err, results) => {
          if (err) {
            return res.status(500).send("Error inserting student");
          }
          res.send("Student assigned room successfully");
        }
      );
    });
  });
});

app.post("/change-room", (req, res) => {
  const { student_id, room_no } = req.body;
  const findRoomIdQuery = "SELECT room_id FROM Rooms WHERE room_no = ?";
  db.query(findRoomIdQuery, [room_no], (err, roomResults) => {
    if (err) {
      return res.status(500).send("Error fetching room ID");
    }
    if (roomResults.length === 0) return res.status(404).send("Room not found");

    const room_id = roomResults[0].room_id;
    const changeRoomQuery = `
      UPDATE Student SET room_id=? WHERE student_id=?`;

    db.query(changeRoomQuery, [room_id, student_id], (err, results) => {
      if (err) {
        return res.status(500).send("Error updating room");
      }
      res.send("Student assigned new room successfully");
    });
  });
});

app.get("/payments", (req, res) => {
  db.query(
    "SELECT S.student_id AS student_id,U.name AS name,R.room_no AS room_no,R.floor_no AS floor_no,P.amount as amount,P.sem as sem FROM Student S INNER JOIN Users U ON U.user_id=S.student_id INNER JOIN Rooms R ON R.room_id=S.room_id INNER JOIN Payments P ON P.student_id=S.student_id WHERE P.status='Paid' ORDER BY P.sem DESC,R.room_no ASC",
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

app.get("/payments/pending", (req, res) => {
  db.query(
    "SELECT S.student_id AS student_id,U.name AS name,R.room_no AS room_no,R.floor_no AS floor_no,P.amount as amount,P.sem as sem FROM Student S INNER JOIN Users U ON U.user_id=S.student_id INNER JOIN Rooms R ON R.room_id=S.room_id INNER JOIN Payments P ON P.student_id=S.student_id WHERE P.status='Unpaid' ORDER BY P.sem DESC,R.room_no ASC",
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

app.post("/payments/mark-paid", (req, res) => {
  const { student_id } = req.body;
  const updateQuery = `UPDATE Payments SET status='Paid' WHERE student_id=?`;
  db.query(updateQuery, [student_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/CheckOuts", (req, res) => {
  const { student_id } = req.body;
  const checkInOutQuery = `SELECT CR.student_id AS student_id,U.name AS name,CR.room_no AS room_no,CR.floor_no AS floor_no,CR.checkout_time AS checkout_time,CR.checkin_time AS checkin_time FROM (SELECT * FROM checkin_checkout NATURAL JOIN rooms) AS CR INNER JOIN Users U ON U.user_id=CR.student_id WHERE CR.student_id=? ORDER BY checkout_time DESC`;
  db.query(checkInOutQuery, [student_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/student/remove-student", (req, res) => {
  const { student_id, end_date } = req.body;
  const removeQuery = `UPDATE Student SET end_date=? WHERE student_id=?`;
  db.query(removeQuery, [end_date, student_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on Port: ${PORT}`);
});
