const express = require("express");
const router = express.Router();
const pool = require("../db"); // PostgreSQL pool connection

// Save map data
router.post("/save", async (req, res) => {
  const { user_id, name, data } = req.body;

  if (!user_id || !name || !data) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO maps (user_id, name, data)
      VALUES ($1, $2, $3) RETURNING id
    `;
    const values = [user_id, name, JSON.stringify(data)];

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to save map" });
  }
});



module.exports = router;
