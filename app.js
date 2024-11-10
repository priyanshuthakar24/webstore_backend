const express = require('express');
const http = require('http');
const createError = require('http-errors');
const morgan = require('morgan');
const cors = require('cors');
const socketIO = require('socket.io');
require('dotenv').config();
const { connectDB } = require('./db/connectDB');
const cookie_parser = require('cookie-parser');
const app = express();
app.use(cors({
  origin: `${process.env.CLIENT_URL}`, // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cookie_parser());
app.get('/', async (req, res, next) => {
  res.send({ message: 'Awesome it works 🐻' });
});

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
// Socket.IO connection setup
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Handle events here, e.g., order updates
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// Initialize routes with io instance
app.use((req, res, next) => {
  req.io = io
  return next()
})
require('./routes')(app, io); // Pass io to routes
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 @ http://localhost:${PORT}`)
});
