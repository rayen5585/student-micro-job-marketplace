const express = require('express');
const cors = require('cors');
const jobRoutes = require('./modules/jobs/job.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});