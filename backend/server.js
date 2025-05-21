const express = require('express');
const app = express();
require("dotenv").config()
const bodyParser = require('body-parser');
const { connectDB } = require('./connectDBnew');
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes')
const submissionRoutes = require('./routes/submissionRoutes')
const contestRoutes = require('./routes/contestRoutes')
const rateLimit = require('express-rate-limit')
const PORT = process.env.PORT || 4000;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json())
app.set('trust proxy', 1);
const limit=rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again after an hour' 
})

app.get('/health', async (req, res) => {
    res.send('Server is running');
});

app.use('/user',limit, userRoutes);
app.use('/contest',limit, contestRoutes)
app.use('/problem',limit, problemRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});

connectDB();