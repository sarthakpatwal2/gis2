const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

module.exports = pool;

/*
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,       // Add your PostgreSQL username
  host: process.env.DB_HOST,       // Add your PostgreSQL host (e.g., localhost)
  database: process.env.DB_NAME,   // Add your PostgreSQL database name
  password: process.env.DB_PASSWORD, // Add your PostgreSQL password
  port: process.env.DB_PORT || 5432, // Add your PostgreSQL port (default: 5432)
});

module.exports = pool;
*/
