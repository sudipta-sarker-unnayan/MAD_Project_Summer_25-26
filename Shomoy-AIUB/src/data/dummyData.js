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
  { id: 'SWC-2024-004', name: 'Nusrat Jahan Mim',        department: 'CSE',   batch: '48th', bloodGroup: 'A-',  phone: '01312345678', role: 'Member', status: 'Active', joinDate: 'March 2024',    email: 'mim@aiub.edu'     },
  { id: 'SWC-2024-005', name: 'Rakibul Hasan Shanto',    department: 'CIS',   batch: '47th', bloodGroup: 'O-',  phone: '01412345678', role: 'Member', status: 'Active', joinDate: 'February 2024', email: 'shanto@aiub.edu'  },
  { id: 'SWC-2023-010', name: 'Shaharia Rahman Tanvir',  department: 'CSE',   batch: '45th', bloodGroup: 'AB+', phone: '01612345678', role: 'Alumni', status: 'Alumni', joinDate: 'March 2022',    email: 'tanvir@aiub.edu'  },
  { id: 'SWC-2023-014', name: 'Farhana Akter Nishi',     department: 'ENG',   batch: '45th', bloodGroup: 'B-',  phone: '01712345679', role: 'Alumni', status: 'Alumni', joinDate: 'April 2022',    email: 'nishi@aiub.edu'   },
  { id: 'ADMIN-001',    name: 'Club Admin',               department: 'Admin', batch: '—',    bloodGroup: 'O+',  phone: '01512345678', role: 'Admin',  status: 'Active', joinDate: 'Jan 2023',      email: 'admin@aiub.edu'   },
];

// ─── Events ──────────────────────────────────────────────────
export const events = [
  {
    id: 'EVT-001',
    title: 'Blood Donation Camp',
    date: 'August 5, 2026',
    location: 'AIUB Main Campus',
    description: 'ক্যাম্পাসে দিনব্যাপী রক্তদান কর্মসূচি, সকল বিভাগের শিক্ষার্থীরা অংশ নিতে পারবেন।',
    time: '10:00 AM - 4:00 PM',
    applyDeadline: '2026-08-03T18:00',
    trackerStep: 2,        // 0: Planning, 1: Preparation, 2: In Progress, 3: Completed
    committeeOpen: false,
    announcement: 'রক্তদান কর্মসূচির জন্য মেডিকেল টিম প্রস্তুত থাকবে, সাথে জাতীয় পরিচয়পত্র আনতে ভুলবেন না।',
    applicants: [
      { userId: 'SWC-2024-002', name: 'Mahbub Md Eftikhar', appliedAt: '2026-07-20T10:00:00.000Z', status: 'selected' },
      { userId: 'SWC-2024-003', name: 'Md Sarwar Jahangir',  appliedAt: '2026-07-21T11:00:00.000Z', status: 'pending'  },
    ],
    selectionPublished: true,
  },
  {
    id: 'EVT-002',
    title: 'Winter Clothes Distribution',
    date: 'August 20, 2026',
    location: 'Mirpur Slum Area',
    description: 'শীতার্ত মানুষদের মধ্যে গরম কাপড় বিতরণ কর্মসূচি।',
    time: '9:00 AM - 1:00 PM',
    applyDeadline: '2026-08-15T18:00',
    trackerStep: 0,
    committeeOpen: true,
    announcement: '',
    applicants: [],
    selectionPublished: false,
  },
  {
    id: 'EVT-000',
    title: 'Orientation Program 2025',
    date: 'January 15, 2025',
    location: 'AIUB Auditorium',
    description: 'নতুন সদস্যদের জন্য পরিচিতি ও ক্লাব সম্পর্কে ধারণা প্রদান অনুষ্ঠান।',
    time: '11:00 AM - 1:00 PM',
    applyDeadline: null,
    trackerStep: 3,         // সম্পন্ন — আর্কাইভ সেকশনে দেখাবে
    committeeOpen: false,
    announcement: 'ধন্যবাদ সবাইকে অংশগ্রহণের জন্য, অনুষ্ঠান সফলভাবে সম্পন্ন হয়েছে।',
    applicants: [
      { userId: 'SWC-2024-001', name: 'Sudipta Sarker Unnayan', appliedAt: '2025-01-05T09:00:00.000Z', status: 'selected' },
    ],
    selectionPublished: true,
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
  {
    id: 'BR-002',
    bloodGroup: 'O-',
    hospital: 'United Hospital',
    requester: 'Nusrat Jahan Mim',
    date: 'July 20, 2026',
    urgency: 'Urgent',
    status: 'Active',
  },
  {
    id: 'BR-003',
    bloodGroup: 'A+',
    hospital: 'AIUB Medical Center',
    requester: 'Mahbub Md Eftikhar',
    date: 'July 10, 2026',
    urgency: 'Normal',
    status: 'Fulfilled',
  },
  {
    id: 'BR-004',
    bloodGroup: 'AB+',
    hospital: 'Labaid Hospital',
    requester: 'Shaharia Rahman Tanvir',
    date: 'June 28, 2026',
    urgency: 'Normal',
    status: 'Fulfilled',
  },
];

// ─── Notifications ───────────────────────────────────────────
export const notifications = [
  { id: 'N-001', type: 'event',     title: 'নতুন ইভেন্ট প্রকাশিত হয়েছে',      body: 'Winter Clothes Distribution — কমিটির জন্য আবেদন শুরু হয়েছে।', time: 'July 15, 2026', read: false },
  { id: 'N-002', type: 'blood',     title: 'জরুরি রক্তের প্রয়োজন 🩸',          body: 'O- রক্ত প্রয়োজন United Hospital-এ।',                          time: 'July 20, 2026', read: false },
  { id: 'N-003', type: 'selected',  title: 'আপনি নির্বাচিত হয়েছেন 🎉',        body: 'Blood Donation Camp ইভেন্টের কমিটির জন্য আপনাকে নির্বাচন করা হয়েছে।', time: 'July 21, 2026', read: true  },
  { id: 'N-004', type: 'committee', title: 'প্রোফাইল তথ্য আপডেট করুন',        body: 'আপনার প্রোফাইলে ফোন নম্বর যুক্ত করা হয়নি।',                    time: 'July 12, 2026', read: true  },
];