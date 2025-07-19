const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });
connectDB();

const app = express();
const server = http.createServer(app);
const PORT = 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", require("./routes/auth.route"));
app.use("/student", require("./routes/student.route"));
app.use("/admin", require("./routes/admin.route"));
app.use("/room", require("./routes/room.route"));
app.use("/checkinout", require("./routes/checkInOut.route"));

app.use("/payment", require("./routes/payment.route"));

server.listen(PORT, () => {
  console.log(`Server listening on Port: ${PORT}`);
});
