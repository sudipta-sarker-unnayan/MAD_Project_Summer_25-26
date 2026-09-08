require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const members = [
  { id: 'SWC-2024-001', name: 'Sudipta Sarker Unnayan', department: 'CSE', batch: '47th', bloodGroup: 'B+', phone: '01712345678', role: 'Member', status: 'Active', joinDate: 'January 2024', email: 'unnayan@aiub.edu' },
  { id: 'SWC-2024-002', name: 'Mahbub Md Eftikhar', department: 'EEE', batch: '46th', bloodGroup: 'A+', phone: '01812345678', role: 'Member', status: 'Active', joinDate: 'February 2024', email: 'mahbub@aiub.edu' },
  { id: 'SWC-2024-003', name: 'Md Sarwar Jahangir', department: 'BBA', batch: '47th', bloodGroup: 'O+', phone: '01912345678', role: 'Member', status: 'Active', joinDate: 'January 2024', email: 'sarwar@aiub.edu' },
  { id: 'SWC-2024-004', name: 'Nusrat Jahan Mim', department: 'CSE', batch: '48th', bloodGroup: 'A-', phone: '01312345678', role: 'Member', status: 'Active', joinDate: 'March 2024', email: 'mim@aiub.edu' },
  { id: 'SWC-2024-005', name: 'Rakibul Hasan Shanto', department: 'CIS', batch: '47th', bloodGroup: 'O-', phone: '01412345678', role: 'Member', status: 'Active', joinDate: 'February 2024', email: 'shanto@aiub.edu' },
  { id: 'SWC-2023-010', name: 'Shaharia Rahman Tanvir', department: 'CSE', batch: '45th', bloodGroup: 'AB+', phone: '01612345678', role: 'Alumni', status: 'Alumni', joinDate: 'March 2022', email: 'tanvir@aiub.edu' },
  { id: 'SWC-2023-014', name: 'Farhana Akter Nishi', department: 'ENG', batch: '45th', bloodGroup: 'B-', phone: '01712345679', role: 'Alumni', status: 'Alumni', joinDate: 'April 2022', email: 'nishi@aiub.edu' },
  { id: 'ADMIN-001', name: 'Club Admin', department: 'Admin', batch: '—', bloodGroup: 'O+', phone: '01512345678', role: 'Admin', status: 'Active', joinDate: 'Jan 2023', email: 'admin@aiub.edu' },
];

const credentials = [
  { id: 'SWC-2024-001', password: '123456' },
  { id: 'ADMIN-001', password: 'admin123' },
];

async function run() {
  for (const m of members) {
    const cred = credentials.find((c) => c.id === m.id);
    const plainPassword = cred ? cred.password : 'changeme123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    await pool.query(
      `INSERT INTO users (id, name, password, role, status, department, batch, blood_group, phone, email, join_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [m.id, m.name, hashed, m.role, m.status, m.department, m.batch, m.bloodGroup, m.phone, m.email, m.joinDate]
    );
  }
  console.log('Seed complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});