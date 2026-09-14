require('dotenv').config();
const pool = require('./db');

const donationDrives = [
  {
    id: 'DD-001',
    title: 'Winter Relief Fund',
    description: 'শীতার্ত মানুষদের জন্য কম্বল ও শীতবস্ত্র কেনার জন্য অর্থ সংগ্রহ অভিযান।',
    goalAmount: 50000,
    deadline: '2026-08-25',
    status: 'Active',
    donors: [
      { userId: 'SWC-2024-001', name: 'Sudipta Sarker Unnayan', amount: 500, date: '2026-07-15T10:00:00.000Z' },
      { userId: 'SWC-2024-002', name: 'Mahbub Md Eftikhar', amount: 1000, date: '2026-07-18T10:00:00.000Z' },
    ],
  },
  {
    id: 'DD-002',
    title: 'Flood Relief 2026',
    description: 'বন্যা দুর্গতদের জন্য জরুরি ত্রাণ সংগ্রহ অভিযান।',
    goalAmount: 100000,
    deadline: '2026-09-10',
    status: 'Active',
    donors: [
      { userId: 'SWC-2024-003', name: 'Md Sarwar Jahangir', amount: 2000, date: '2026-07-20T10:00:00.000Z' },
    ],
  },
];

const bloodRequests = [
  { id: 'BR-001', bloodGroup: 'B+', hospital: 'Square Hospital', requesterId: 'SWC-2024-001', date: 'July 18, 2026', urgency: 'Urgent', status: 'Active' },
  { id: 'BR-002', bloodGroup: 'O-', hospital: 'United Hospital', requesterId: 'SWC-2024-004', date: 'July 20, 2026', urgency: 'Normal', status: 'Active' },
];

async function run() {
  for (const d of donationDrives) {
    const raised = d.donors.reduce((sum, don) => sum + don.amount, 0);
    await pool.query(
      `INSERT INTO donation_drives (id, title, description, goal_amount, raised_amount, deadline, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING`,
      [d.id, d.title, d.description, d.goalAmount, raised, d.deadline, d.status]
    );
    for (const don of d.donors) {
      await pool.query(
        `INSERT INTO donation_donors (drive_id, user_id, name, amount, donated_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [d.id, don.userId, don.name, don.amount, don.date]
      );
    }
  }

  for (const b of bloodRequests) {
    await pool.query(
      `INSERT INTO blood_requests (id, blood_group, hospital, requester_id, urgency, status, date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING`,
      [b.id, b.bloodGroup, b.hospital, b.requesterId, b.urgency, b.status, b.date]
    );
  }

  console.log('Welfare seed complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});