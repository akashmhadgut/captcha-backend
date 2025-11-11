const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { swaggerSpec, swaggerUi } = require("./config/swagger");

dotenv.config();
const app = express();
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ required for form-data text fields
app.use(cors());

// ✅ Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Static uploads folder
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/plans", require("./routes/planRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/captcha", require("./routes/captchaRoutes"));

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running fine 🚀" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
