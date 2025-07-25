const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');

const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const courseRoutes = require('./routes/course');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve static files

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`);
});

connectDB();

// Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/course', courseRoutes);

// Default route
app.get('/', (req, res) => {
    res.send(`<div>This is Default Route<p>Everything is OK</p></div>`);
});
