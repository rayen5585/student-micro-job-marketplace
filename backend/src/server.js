require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// ─── Models (must be loaded before sync) ────────────────────────────────────
require('./modules/users/user.model');           // Rayen: users table (proposals, search, admin)
require('./models/Student');                     // Khoubaib: students table (auth, profile, role)
require('./modules/jobs/job.model');             // jobs table
require('./modules/proposals/proposal.associations'); // proposals + FK relations

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

// Student 1 (Khoubaib): Auth (register/login/google), student profile, role
app.use('/api', require('./modules/users/users.routes'));

// Student 2: Jobs CRUD
app.use('/api/jobs', require('./modules/jobs/job.routes'));

// Student 3 (Rayen): Proposals (submit, accept, reject, complete)
app.use('/api/proposals', require('./modules/proposals/proposal.routes'));

// Student 4 (Rayen): Search, facets, bid sorting
app.use('/api/search', require('./modules/search/search.routes'));

// Admin panel
app.use('/api/admin', require('./modules/admin/admin.routes'));

// Notifications
app.use('/api/notifications', require('./modules/notifications/notification.routes'));

// Messages / Chat
app.use('/api/messages', require('./modules/messages/message.routes'));

// Ratings
app.use('/api/ratings', require('./modules/ratings/rating.routes'));

// ─── Global Error Handler (must be last) ────────────────────────────────────
app.use(require('./middlewares/error.middleware'));

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

sequelize
  .sync() // creates tables if they don't exist
  .then(() => {
    console.log('✅ Database connected & tables synced');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Database error:', err.message || err);
    process.exit(1);
  });
