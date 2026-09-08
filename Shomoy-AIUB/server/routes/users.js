const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT id, name, role, status, department, batch, blood_group, phone, email, join_date FROM users WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'User পাওয়া যায়নি' });
  res.json(result.rows[0]);
});

// PATCH /api/users/:id   — প্রোফাইল আপডেট (ProfileScreen / MemberProfileScreen / AdminProfileScreen)
router.patch('/:id', async (req, res) => {
  const fields = ['name', 'department', 'batch', 'blood_group', 'phone', 'email'];
  const updates = [];
  const values = [];
  fields.forEach((f) => {
    const bodyKey = f === 'blood_group' ? 'bloodGroup' : f;
    if (req.body[bodyKey] !== undefined) {
      updates.push(`${f} = $${updates.length + 1}`);
      values.push(req.body[bodyKey]);
    }
  });
  if (!updates.length) return res.status(400).json({ success: false, message: 'কোনো ফিল্ড দেওয়া হয়নি' });
  values.push(req.params.id);
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id, name, role, status, department, batch, blood_group, phone, email, join_date`,
    values
  );
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'User পাওয়া যায়নি' });
  res.json({ success: true, user: result.rows[0] });
});

module.exports = router;