const express = require('express');
const app = express();
const User = require('../models/userModel');

app.get('/', (req, res) => {
    res.send('Hello user');
});

app.get('/profile/:ID', async (req, res) => {
    try {
        const id = req.params.ID;
        const details = await User.findOne({ name: id }).populate('problems_submitted')
        if (!details || details.length == 0) {
            return res.status(404).send({ "msg": "User not found" });
        }
        return res.send(details);
    } catch (error) {
        console.error('Error fetching user by name:', error);
    }
});

app.post('/register', async (req, res) => {
    try {
        const { userid, name } = req.body;
        if (!userid || !name) {
            return res.status(400).send('Information is missing');
        }

        // Check if the user already exists
        const oldUser = await User.findOne({ userid });
        if (oldUser) {
            return res.status(400).send('User already exists');
        }

        // Create a new user
        const newUser = new User(req.body);
        await newUser.save();

        return res.send(newUser);
    } catch (err) {
        console.error("Error creating user in my database:", err);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/userinfo', async (req, res) => {
    try {
        const id = req.body.uid;
        const user = await User.findOne({ userid: id });
        return res.send(user);
    } catch (err) {
        console.error("Error fetching user info:");
        return res.status(500).send('Internal Server Error');
    }
})

app.put('/changeinfo', async (req, res) => {
    try {
        const { name, email, userid, profile_pic } = req.body
        if (!name || !email || !userid)
            return res.status(400).send("Information is missing")
        const user = await User.findOne({ userid })
        if (!user)
            return res.status(404).send("User not found")
        const userpresent = await User.findOne({ name })
        if (userpresent && user.userid != userid)
            return res.status(404).send("User already exists")
        user.name = name
        user.email = email
        user.profile_pic = profile_pic
        await user.save()
        return res.send(user)
    } catch (err) {
        console.error("Error changing user info:", err);
        return res.status(500).send('Internal Server Error');
    }
})

app.post('/deleteuser', async (req, res) => {
    try {
        const id = req.body.ID
        await User.findByIdAndDelete({ _id: id })
        return res.send("User deleted")
    } catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).send('Internal Server Error');
    }
})
module.exports = app;