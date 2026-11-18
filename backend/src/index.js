const express = require('express');
const cors = require('cors');
const sequelize = require('./utils/db');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// models (lazem 9bal sync)
require('./modules/proposals/model');

const jobRoutes = require('./modules/jobs/job.routes');

app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
  res.send('Student Micro-Job Marketplace API is running!');
});

const PORT = 3000;

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database error:', err);
  });