require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// Models + relations
require('./modules/users/user.model');
require('./modules/jobs/job.model');
require('./modules/proposals/proposal.associations'); // ⭐

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// Routes
app.use('/api/proposals', require('./modules/proposals/proposal.routes')); // ⭐
app.use('/api/search', require('./modules/search/search.routes')); // ⭐ Student 4
// Error handler lazem ykoun fel a5er
app.use(require('./middlewares/error.middleware')); // ⭐

const PORT = process.env.PORT || 3000;

sequelize
  .sync() // ya3mel el tables ken ma3andhomch
  .then(() => {
    console.log('✅ Database connected & tables synced');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('❌ Database error:', err));