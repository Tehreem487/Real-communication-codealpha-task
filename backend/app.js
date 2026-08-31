const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes');

const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        process.env.FRONTEND_URL === origin
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message:
      'Real-Time Communication API is running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy',
  });
});

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/rooms',
  roomRoutes
);

app.use(
  '/api/messages',
  messageRoutes
);

app.use(
  '/api/files',
  fileRoutes
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;