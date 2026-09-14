require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const donationRoutes = require('./routes/donations');
const bloodRequestRoutes = require('./routes/blood-requests');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);

app.get('/', (req, res) => res.json({ status: 'Shomoy API running' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));