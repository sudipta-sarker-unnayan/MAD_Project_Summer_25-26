const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { memberId, password } = req.body;
    if (!memberId || !password) {
      return res.status(400).json({ success: false, message: 'ID ও পাসওয়ার্ড দিন' });
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [memberId]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ success: false, message: 'Wrong ID or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Wrong ID or password' });

    const { password: _pw, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Something went wrong, please try again.' });
  }
});

module.exports = router;