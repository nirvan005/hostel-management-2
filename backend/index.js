const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const globalErrorHandler = require("./middlewares/error.middleware");
const AppError = require("./utils/AppError");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });
connectDB();

const app = express();
const server = http.createServer(app);
const PORT = 4000;
// Standard Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080", "http://127.0.0.1:5173", "http://127.0.0.1:8080"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Security Middlewares
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  max: 1000, // Limit each IP to 1000 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 Minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/hostels", require("./routes/hostel.routes"));
app.use("/api/rooms", require("./routes/room.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/leaves", require("./routes/leave.routes"));
app.use("/api/invoices", require("./routes/invoice.routes"));
app.use("/api/invites", require("./routes/invite.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/requests", require("./routes/request.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);


server.listen(PORT, () => {
  console.log(`Server listening on Port: ${PORT}`);
});
