const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import modular routes
const { authRoutes, authenticate, getISTTimestamp } = require('./auth');
const holidayRoutes = require('./holiday');
const timesheetRoutes = require('./timesheet');
const blobsRoutes = require('./blobs');
const invoiceRoutes = require('./invoice');
const quotationRoutes = require('./quotation');
const employeeRoutes = require('./employee');
const companyRoutes = require('./company');
const notificationRoutes = require('./notification');

const app = express();
app.use(cors());
app.use(express.json());

// Register routes under /api
app.use('/api', authRoutes);
app.use('/api', authenticate, holidayRoutes);
app.use('/api', authenticate, timesheetRoutes);
app.use('/api', authenticate, blobsRoutes);
app.use('/api', authenticate, invoiceRoutes);
app.use('/api', authenticate, quotationRoutes);
app.use('/api', authenticate, employeeRoutes);
app.use('/api', authenticate, companyRoutes);
app.use('/api', authenticate, notificationRoutes);

// Redirect /login to / since the homepage serves as the login page
// This redirect is handled by Nginx for client-side routing.
// If a request for /login somehow reaches the BFF, this will still redirect to /.
// app.get('/login', (req, res) => {
//   console.log(`[${getISTTimestamp()}] Redirecting /login to homepage (/)`);
//   res.redirect('/');
// });

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../build')));

// Catch-all handler: for any request that doesn't match an API route or static file,
// send back React's index.html file to support client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[${getISTTimestamp()}] BFF listening on http://localhost:${PORT}`));