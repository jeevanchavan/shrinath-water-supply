const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const morgan      = require("morgan");
const rateLimit   = require("express-rate-limit");
const dotenv      = require("dotenv");
const connectDB   = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");
const path = require("path")

dotenv.config();

// Guard: fail fast if critical env vars are missing
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET is missing or too short (min 32 chars). Set it in .env and restart.");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("FATAL: MONGO_URI is not set. Set it in .env and restart.");
  process.exit(1);
}

connectDB();

const app = express();

app.set("trust proxy", 1);

app.use(express.static("./public"))
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "https://shrinath-water-distributors.onrender.com", credentials: true }));
app.use(express.json({ limit: "10kb" }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Routes
app.use("/api/auth",      require("./src/routes/authRoutes"));
app.use("/api/drivers",   require("./src/routes/driverRoutes"));
app.use("/api/customers", require("./src/routes/customerRoutes"));
app.use("/api/trips",     require("./src/routes/tripRoutes"));
app.use("/api/payments",  require("./src/routes/paymentRoutes"));
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));

// app.get("/api/health", (req, res) => res.json({ ok: true, app: "Shrinath Water Distributors" }));
// app.use("*", (req, res) => res.status(404).json({ success: false, message: "Route not found" }));


app.use(express.static(path.join(__dirname, "dist")));

// wildcard api
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Shrinath Water Distributors server running on port ${PORT} [${process.env.NODE_ENV}]`));
