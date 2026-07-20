// ─── Login credentials ─────────────────────────────────────────
export const credentials = [
  { id: 'SWC-2024-001', password: '123456',   role: 'Member' },
  { id: 'ADMIN-001',    password: 'admin123', role: 'Admin'  },
];

// ─── Members ───────────────────────────────────────────────────
export const members = [
  { id: 'SWC-2024-001', name: 'Sudipta Sarker Unnayan',  department: 'CSE',   batch: '47th', bloodGroup: 'B+',  phone: '01712345678', role: 'Member', status: 'Active', joinDate: 'January 2024',  email: 'unnayan@aiub.edu' },
  { id: 'SWC-2024-002', name: 'Mahbub Md Eftikhar',      department: 'EEE',   batch: '46th', bloodGroup: 'A+',  phone: '01812345678', role: 'Member', status: 'Active', joinDate: 'February 2024', email: 'mahbub@aiub.edu'  },
  { id: 'SWC-2024-003', name: 'Md Sarwar Jahangir',      department: 'BBA',   batch: '47th', bloodGroup: 'O+',  phone: '01912345678', role: 'Member', status: 'Active', joinDate: 'January 2024',  email: 'sarwar@aiub.edu'  },
  { id: 'SWC-2023-010', name: 'Shaharia Rahman Tanvir',  department: 'CSE',   batch: '45th', bloodGroup: 'AB+', phone: '01612345678', role: 'Alumni', status: 'Alumni', joinDate: 'March 2022',    email: 'tanvir@aiub.edu'  },
  { id: 'ADMIN-001',    name: 'Club Admin',               department: 'Admin', batch: '—',    bloodGroup: 'O+',  phone: '01512345678', role: 'Admin',  status: 'Active', joinDate: 'Jan 2023',      email: 'admin@aiub.edu'   },
];

// ─── Events ──────────────────────────────────────────────────
export const events = [
  {
    id: 'EVT-001',
    title: 'Blood Donation Camp',
    date: 'August 5, 2026',
    location: 'AIUB Main Campus',
    trackerStep: 1,        // 0: Planning, 1: Preparation, 2: In Progress, 3: Completed
    committeeOpen: true,
  },
  {
    id: 'EVT-002',
    title: 'Winter Clothes Distribution',
    date: 'August 20, 2026',
    location: 'Mirpur Slum Area',
    trackerStep: 0,
    committeeOpen: false,
  },
];

// ─── Blood Requests ──────────────────────────────────────────
export const bloodRequests = [
  {
    id: 'BR-001',
    bloodGroup: 'B+',
    hospital: 'Square Hospital',
    requester: 'Sudipta Sarker Unnayan',
    date: 'July 18, 2026',
    urgency: 'Urgent',
    status: 'Active',
  },
];

// ─── Notifications ───────────────────────────────────────────
export const notifications = [
  { id: 'N-001', title: 'New event added',        read: false },
  { id: 'N-002', title: 'Your profile was updated', read: true  },
];