const express = require('express');
const cors = require('cors');
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[${getISTTimestamp()}] BFF listening on http://localhost:${PORT}`));