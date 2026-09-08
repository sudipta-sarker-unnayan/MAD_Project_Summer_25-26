const pool = require('./db');
const genId = () => `N-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const pushNotification = async ({ recipientId, type, title, body = '', relatedId = null }) => {
  const id = genId();
  await pool.query(
    `INSERT INTO notifications (id, recipient_id, type, title, body, related_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, recipientId, type, title, body, relatedId]
  );
  return id;
};

module.exports = { pushNotification };