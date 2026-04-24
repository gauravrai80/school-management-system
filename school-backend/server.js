const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth.routes');
const student = require('./routes/student.routes');
const teacher = require('./routes/teacher.routes');
const attendance = require('./routes/attendance.routes');
const grade = require('./routes/grade.routes');
const fee = require('./routes/fee.routes');
const payment = require('./routes/payment.routes');
const announcement = require('./routes/announcement.routes');
const homework = require('./routes/homework.routes');
const exam = require('./routes/exam.routes');
const timetable = require('./routes/timetable.routes');
const library = require('./routes/library.routes');
const transport = require('./routes/transport.routes');
const event = require('./routes/event.routes');
const news = require('./routes/news.routes');
const gallery = require('./routes/gallery.routes');
const admission = require('./routes/admission.routes');
const analytics = require('./routes/analytics.routes');
const settings = require('./routes/setting.routes');

const app = express();

// Body parser
app.use(express.json());

// Security Headers
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Morgan for logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Mount routers
app.get('/', (req, res) => {
  res.send('School Management System API is running...');
});

app.use('/api/auth', auth);
app.use('/api/students', student);
app.use('/api/teachers', teacher);
app.use('/api/attendance', attendance);
app.use('/api/grades', grade);
app.use('/api/fees', fee);
app.use('/api/payments', payment);
app.use('/api/announcements', announcement);
app.use('/api/homework', homework);
app.use('/api/exams', exam);
app.use('/api/timetable', timetable);
app.use('/api/library', library);
app.use('/api/transport', transport);
app.use('/api/events', event);
app.use('/api/news', news);
app.use('/api/gallery', gallery);
app.use('/api/admissions', admission);
app.use('/api/analytics', analytics);
app.use('/api/settings', settings);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
