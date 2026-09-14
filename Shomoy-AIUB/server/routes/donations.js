const express = require('express');
const pool = require('../db');
const { pushNotification } = require('../notify');

const router = express.Router();
const genId = () => `DD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// GET /api/donations
router.get('/', async (req, res) => {
  const drives = (await pool.query('SELECT * FROM donation_drives ORDER BY created_at DESC')).rows;
  const donors = (await pool.query('SELECT * FROM donation_donors ORDER BY date DESC')).rows;
  const merged = drives.map((d) => ({
    ...d,
    donors: donors.filter((don) => don.drive_id === d.id),
  }));
  res.json(merged);
});

// GET /api/donations/:id
router.get('/:id', async (req, res) => {
  const drive = (await pool.query('SELECT * FROM donation_drives WHERE id = $1', [req.params.id])).rows[0];
  if (!drive) return res.status(404).json({ success: false, message: 'ড্রাইভ পাওয়া যায়নি' });
  const donors = (await pool.query(
    'SELECT * FROM donation_donors WHERE drive_id = $1 ORDER BY date DESC',
    [req.params.id]
  )).rows;
  res.json({ ...drive, donors });
});

// POST /api/donations   (Admin creates a new drive)
// body: { title, description, goalAmount, deadline }
router.post('/', async (req, res) => {
  const { title, description, goalAmount, deadline } = req.body;
  if (!title || !goalAmount) {
    return res.status(400).json({ success: false, message: 'title ও goalAmount আবশ্যক' });
  }
  const id = genId();
  const result = await pool.query(
    `INSERT INTO donation_drives (id, title, description, goal_amount, raised_amount, deadline, status)
     VALUES ($1,$2,$3,$4,0,$5,'Active') RETURNING *`,
    [id, title, description || '', goalAmount, deadline || null]
  );
  res.status(201).json(result.rows[0]);
});

// PATCH /api/donations/:id   (edit basic fields)
router.patch('/:id', async (req, res) => {
  const fields = ['title', 'description', 'goal_amount', 'deadline', 'status'];
  const bodyKeyMap = { goal_amount: 'goalAmount' };
  const updates = [];
  const values = [];
  fields.forEach((f) => {
    const bodyKey = bodyKeyMap[f] || f;
    if (req.body[bodyKey] !== undefined) {
      updates.push(`${f} = $${updates.length + 1}`);
      values.push(req.body[bodyKey]);
    }
  });
  if (!updates.length) return res.status(400).json({ success: false, message: 'কোনো ফিল্ড দেওয়া হয়নি' });
  values.push(req.params.id);
  const result = await pool.query(
    `UPDATE donation_drives SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'ড্রাইভ পাওয়া যায়নি' });
  res.json(result.rows[0]);
});

// DELETE /api/donations/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM donation_donors WHERE drive_id = $1', [req.params.id]);
  await pool.query('DELETE FROM donation_drives WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// POST /api/donations/:id/donate   body: { userId, name, amount }
// Called by DonationDriveScreen (via donationService.donate)
router.post('/:id/donate', async (req, res) => {
  const { userId, name, amount } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'সঠিক পরিমাণ দিন' });
  }

  const drive = (await pool.query('SELECT * FROM donation_drives WHERE id = $1', [req.params.id])).rows[0];
  if (!drive) return res.status(404).json({ success: false, message: 'ড্রাইভ পাওয়া যায়নি' });
  if (drive.status === 'Completed') {
    return res.status(400).json({ success: false, message: 'এই ড্রাইভ ইতিমধ্যে সম্পন্ন হয়েছে' });
  }

  await pool.query(
    `INSERT INTO donation_donors (drive_id, user_id, name, amount, date) VALUES ($1,$2,$3,$4,NOW())`,
    [req.params.id, userId, name, numAmount]
  );

  const newRaised = Number(drive.raised_amount) + numAmount;
  const goalReached = newRaised >= Number(drive.goal_amount);

  await pool.query(
    `UPDATE donation_drives SET raised_amount = $1, status = $2 WHERE id = $3`,
    [newRaised, goalReached ? 'Completed' : drive.status, req.params.id]
  );

  if (goalReached) {
    await pushNotification({
      recipientId: 'broadcast',
      type: 'event',
      title: 'লক্ষ্য পূরণ হয়েছে 🎉',
      body: `${drive.title} — সংগ্রহের লক্ষ্যমাত্রা সম্পূর্ণ হয়েছে, ধন্যবাদ সবাইকে।`,
      relatedId: req.params.id,
    });
  }

  res.json({ success: true, goalReached });
});

module.exports = router;