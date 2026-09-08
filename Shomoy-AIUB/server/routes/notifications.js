const express = require('express');
const pool = require('../db');
const { pushNotification } = require('../notify');

const router = express.Router();

// GET /api/notifications/:userId
router.get('/:userId', async (req, res) => {
  const rows = (await pool.query(
    `SELECT * FROM notifications WHERE recipient_id = $1 OR recipient_id = 'broadcast' ORDER BY created_at DESC`,
    [req.params.userId]
  )).rows;
  res.json(rows);
});

// GET /api/notifications/:userId/unread-count
router.get('/:userId/unread-count', async (req, res) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE (recipient_id = $1 OR recipient_id = 'broadcast') AND read = false`,
    [req.params.userId]
  );
  res.json({ count: Number(result.rows[0].count) });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  await pool.query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// PATCH /api/notifications/:userId/read-all
router.patch('/:userId/read-all', async (req, res) => {
  await pool.query(
    `UPDATE notifications SET read = true WHERE recipient_id = $1 OR recipient_id = 'broadcast'`,
    [req.params.userId]
  );
  res.json({ success: true });
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// POST /api/notifications   (সরাসরি নোটিফিকেশন পাঠানোর জন্য, যেমন BloodRequestScreen থেকে)
router.post('/', async (req, res) => {
  const id = await pushNotification(req.body);
  res.status(201).json({ success: true, id });
});

module.exports = router;