// Import required packages
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const mapRoutes = require("./routes/mapRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

// PostgreSQL connection setup for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

// Check database connection
pool.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to Neon PostgreSQL database");
  }
});

// Route setup
app.use("/api/auth", authRoutes); // User authentication routes
app.use("/api/maps", mapRoutes); // Map-related routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

});
