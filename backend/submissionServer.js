const express = require('express');
const app = express();
require("dotenv").config()
const bodyParser = require('body-parser');
const { connectDB } = require('./connectDBnew');
const submissionRoutes = require('./routes/submissionRoutes')
const PORT = process.env.SUBMISSION_PORT || 4500;
const cors = require('cors');
const Contest = require('./models/contestModel');
const rateLimit = require('express-rate-limit')
const clearFolder = require('./clearFolder')
const path = require('path')
const cron = require('node-cron');

app.set('trust proxy', 1);
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const limit = rateLimit({
    max: 250,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again after an hour'
})

cron.schedule('0 0 * * *', () => {
    console.log('Clearing codes folder');
    const folderPath = path.join(__dirname, 'codes');
    clearFolder(folderPath)
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

app.get('/', (req, res) => {
    res.send('Submission Server is running');
});

app.get('/health', (req, res) => {
    res.send('Server is running');
});

app.use('/submission', limit, submissionRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});

connectDB();