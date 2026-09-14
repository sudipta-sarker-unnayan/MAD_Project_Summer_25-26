const express = require('express');
const pool = require('../db');
const { pushNotification } = require('../notify');

const router = express.Router();
const genId = () => `BR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const SELECT_JOINED = `
  SELECT br.*, u.name AS requester_name, u.phone AS requester_phone
  FROM blood_requests br
  LEFT JOIN users u ON u.id = br.requester_id
`;

// GET /api/blood-requests
router.get('/', async (req, res) => {
  const result = await pool.query(`${SELECT_JOINED} ORDER BY br.created_at DESC`);
  res.json(result.rows);
});

// GET /api/blood-requests/:id
router.get('/:id', async (req, res) => {
  const result = await pool.query(`${SELECT_JOINED} WHERE br.id = $1`, [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি' });
  res.json(result.rows[0]);
});

// POST /api/blood-requests   body: { requesterId, bloodGroup, hospital, urgency, date }
router.post('/', async (req, res) => {
  const { requesterId, bloodGroup, hospital, urgency, date } = req.body;
  if (!requesterId || !bloodGroup || !hospital) {
    return res.status(400).json({ success: false, message: 'bloodGroup ও hospital আবশ্যক' });
  }
  const id = genId();
  await pool.query(
    `INSERT INTO blood_requests (id, blood_group, hospital, requester_id, urgency, status, date)
     VALUES ($1,$2,$3,$4,$5,'Active',$6)`,
    [id, bloodGroup, hospital, requesterId, urgency || 'Normal', date || new Date().toLocaleDateString('en-GB')]
  );

  if ((urgency || 'Normal') === 'Urgent') {
    await pushNotification({
      recipientId: 'broadcast',
      type: 'blood',
      title: 'জরুরি রক্তের প্রয়োজন 🩸',
      body: `${bloodGroup} রক্ত প্রয়োজন ${hospital}-এ।`,
      relatedId: id,
    });
  }

  const created = await pool.query(`${SELECT_JOINED} WHERE br.id = $1`, [id]);
  res.status(201).json(created.rows[0]);
});

// PATCH /api/blood-requests/:id/fulfill
router.patch('/:id/fulfill', async (req, res) => {
  const result = await pool.query(
    `UPDATE blood_requests SET status = 'Fulfilled' WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি' });
  res.json({ success: true });
});

// DELETE /api/blood-requests/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM blood_requests WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;