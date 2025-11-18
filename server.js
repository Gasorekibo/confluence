require('dotenv').config();
const express = require('express');
const pageRoutes = require('./src/routes/pageRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const labelRoutes = require('./src/routes/labelRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(express.json());

// Routes
app.use('/api/pages', pageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/labels', labelRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Confluence API server running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
});

module.exports = app;