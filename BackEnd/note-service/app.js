const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const noteRoutes = require('./src/api/note.routes');

const app = express();

const PORT = process.env.PORT_NOTE || 6100;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.set('trust proxy', 1);

app.use('/api/note', noteRoutes);

app.listen(PORT, () => {
  console.log(`Note-service running at http://localhost:${PORT}`);
});

