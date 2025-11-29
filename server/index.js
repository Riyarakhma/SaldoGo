const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const apiRouter = require('./api');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

// Serve built frontend in production (optional)
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`SaldoGo API running on http://localhost:${PORT}`));