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

router.get("/", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id query parameter" });
  }

  try {
    const query = `
      SELECT id, name, data
      FROM maps
      WHERE user_id = $1
    `;
    const values = [user_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No maps found for this user" });
    }

    res.status(200).json({ success: true, maps: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch maps" });
  }
});



module.exports = router;
