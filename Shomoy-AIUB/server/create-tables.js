require('dotenv').config();
const pool = require('./db');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR PRIMARY KEY,
      title VARCHAR,
      description TEXT,
      date VARCHAR,
      time VARCHAR,
      location VARCHAR,
      apply_deadline VARCHAR,
      committee_open BOOLEAN DEFAULT false,
      selection_published BOOLEAN DEFAULT false,
      tracker_step INT DEFAULT 0,
      announcement TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_applicants (
      id SERIAL PRIMARY KEY,
      event_id VARCHAR REFERENCES events(id),
      user_id VARCHAR,
      name VARCHAR,
      status VARCHAR DEFAULT 'pending',
      UNIQUE(event_id, user_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR PRIMARY KEY,
      recipient_id VARCHAR,
      type VARCHAR,
      title VARCHAR,
      body TEXT,
      related_id VARCHAR,
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('All tables created successfully.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});