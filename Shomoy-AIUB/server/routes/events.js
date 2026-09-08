const express = require('express');
const pool = require('../db');
const { pushNotification } = require('../notify');

const router = express.Router();
const genId = () => `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// GET /api/events
router.get('/', async (req, res) => {
  const events = (await pool.query('SELECT * FROM events ORDER BY created_at DESC')).rows;
  const applicants = (await pool.query('SELECT * FROM event_applicants')).rows;
  const merged = events.map((e) => ({
    ...e,
    applicants: applicants.filter((a) => a.event_id === e.id),
  }));
  res.json(merged);
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const event = (await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id])).rows[0];
  if (!event) return res.status(404).json({ success: false, message: 'ইভেন্ট পাওয়া যায়নি' });
  const applicants = (await pool.query('SELECT * FROM event_applicants WHERE event_id = $1', [req.params.id])).rows;
  res.json({ ...event, applicants });
});

// POST /api/events
router.post('/', async (req, res) => {
  const { title, description, date, time, location, applyDeadline } = req.body;
  const id = genId();
  const result = await pool.query(
    `INSERT INTO events (id, title, description, date, time, location, apply_deadline)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, title, description || '', date, time, location, applyDeadline || null]
  );
  res.status(201).json(result.rows[0]);
});

// PUT/PATCH /api/events/:id  (সাধারণ ফিল্ড আপডেট)
router.patch('/:id', async (req, res) => {
  const fields = ['title', 'description', 'date', 'time', 'location'];
  const updates = [];
  const values = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${updates.length + 1}`);
      values.push(req.body[f]);
    }
  });
  if (!updates.length) return res.status(400).json({ success: false, message: 'কোনো ফিল্ড দেওয়া হয়নি' });
  values.push(req.params.id);
  const result = await pool.query(
    `UPDATE events SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'ইভেন্ট পাওয়া যায়নি' });
  res.json(result.rows[0]);
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// POST /api/events/:id/publish  — কমিটি আবেদন খোলা
router.post('/:id/publish', async (req, res) => {
  const result = await pool.query(
    'UPDATE events SET committee_open = true WHERE id = $1 RETURNING *',
    [req.params.id]
  );
  const event = result.rows[0];
  if (!event) return res.status(404).json({ success: false, message: 'ইভেন্ট পাওয়া যায়নি' });

  await pushNotification({
    recipientId: 'broadcast',
    type: 'event',
    title: 'নতুন ইভেন্ট প্রকাশিত হয়েছে',
    body: `${event.title} — আবেদনের শেষ সময়: ${event.apply_deadline || 'শীঘ্রই জানানো হবে'}`,
    relatedId: event.id,
  });
  res.json({ success: true });
});

// PATCH /api/events/:id/deadline
router.patch('/:id/deadline', async (req, res) => {
  const { newDeadline } = req.body;
  await pool.query(
    'UPDATE events SET apply_deadline = $1, committee_open = true WHERE id = $2',
    [newDeadline, req.params.id]
  );
  res.json({ success: true });
});

// PATCH /api/events/:id/close
router.patch('/:id/close', async (req, res) => {
  await pool.query('UPDATE events SET committee_open = false WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// GET /api/events/:id/applicants
router.get('/:id/applicants', async (req, res) => {
  const applicants = (await pool.query(
    'SELECT * FROM event_applicants WHERE event_id = $1', [req.params.id]
  )).rows;
  res.json(applicants);
});

// POST /api/events/:id/select   body: { selectedUserIds: [] }
router.post('/:id/select', async (req, res) => {
  const { selectedUserIds } = req.body;
  await pool.query(
    `UPDATE event_applicants SET status = CASE WHEN user_id = ANY($1) THEN 'selected' ELSE 'not-selected' END
     WHERE event_id = $2`,
    [selectedUserIds, req.params.id]
  );
  res.json({ success: true });
});

// POST /api/events/:id/publish-selection
router.post('/:id/publish-selection', async (req, res) => {
  const event = (await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id])).rows[0];
  if (!event) return res.status(404).json({ success: false, message: 'ইভেন্ট পাওয়া যায়নি' });

  await pool.query('UPDATE events SET selection_published = true WHERE id = $1', [req.params.id]);

  const selected = (await pool.query(
    `SELECT * FROM event_applicants WHERE event_id = $1 AND status = 'selected'`, [req.params.id]
  )).rows;

  for (const a of selected) {
    await pushNotification({
      recipientId: a.user_id,
      type: 'selected',
      title: 'আপনি নির্বাচিত হয়েছেন 🎉',
      body: `${event.title} ইভেন্টের কমিটির জন্য আপনাকে নির্বাচন করা হয়েছে।`,
      relatedId: event.id,
    });
  }
  res.json({ success: true });
});

// PATCH /api/events/:id/tracker   body: { step }
router.patch('/:id/tracker', async (req, res) => {
  await pool.query('UPDATE events SET tracker_step = $1 WHERE id = $2', [req.body.step, req.params.id]);
  res.json({ success: true });
});

// PATCH /api/events/:id/announcement   body: { text }
router.patch('/:id/announcement', async (req, res) => {
  const previous = (await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id])).rows[0];
  await pool.query('UPDATE events SET announcement = $1 WHERE id = $2', [req.body.text, req.params.id]);

  const text = (req.body.text || '').trim();
  if (text && text !== (previous?.announcement || '').trim()) {
    await pushNotification({
      recipientId: 'broadcast',
      type: 'event',
      title: `${previous?.title || 'ইভেন্ট'} — নতুন ঘোষণা`,
      body: text,
      relatedId: req.params.id,
    });
  }
  res.json({ success: true });
});

// POST /api/events/:id/apply   body: { userId, name, role, status }  — CommitteeApplyScreen (গ্রুপমেট) এইটা কল করবে
router.post('/:id/apply', async (req, res) => {
  const { userId, name, role, status } = req.body;
  const event = (await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id])).rows[0];
  if (!event) return res.status(404).json({ success: false, message: 'ইভেন্ট পাওয়া যায়নি' });
  if (!event.committee_open) return res.status(400).json({ success: false, message: 'আবেদনের সময় এখন বন্ধ আছে' });
  if (!(role === 'Member' && status === 'Active')) {
    return res.status(403).json({ success: false, message: 'শুধুমাত্র Active Member আবেদন করতে পারবেন' });
  }

  try {
    await pool.query(
      `INSERT INTO event_applicants (event_id, user_id, name) VALUES ($1,$2,$3)`,
      [req.params.id, userId, name]
    );
    res.json({ success: true });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ success: false, message: 'আপনি আগেই আবেদন করেছেন' });
    throw e;
  }
});

module.exports = router;