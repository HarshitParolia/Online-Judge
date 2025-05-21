const express = require('express');
const app = express();
const Problem = require('../models/problemModel');
const User = require('../models/userModel');
const Submission = require('../models/submissionModel');

app.get('/', (req, res) => {
    res.send('Hello problem');
});
app.post('/create', async (req, res) => {
    try {
        if (!req.body || !req.body.title || !req.body.question || !req.body.constraints || !req.body.solved_TC_input || !req.body.solved_TC_output || !req.body.allTCarr || !req.body.allCorrectSolnArr || !req.body.rating || !req.body.inputFormat || !req.body.outputFormat || !req.body.userid) {
            return res.status(400).send('Request body is missing');
        }
        const userAuth = await User.findOne({ userid: req.body.userid });
        if (!userAuth || !userAuth.isAdmin) {
            return res.status(401).send('Unauthorized');
        }
        const oldprob = await Problem.findOne({ title: req.body.title });
        if (oldprob) {
            return res.status(400).send('Problem already exists');
        }
        const newProb = new Problem({ ...req.body, author: userAuth.name });
        newProb.save();
        res.send(newProb._id);
    }
    catch (err) {
        console.log("Failed to create problem");
    }
});

app.delete('/delete/:ID', async (req, res) => {

    try {
        const userAuth = await User.findOne({ userid: req.body.userid });
        if (!userAuth || !userAuth.isAdmin) {
            return res.status(401).send('Unauthorized');
        }
        const prob = await Problem.findByIdAndDelete(req.params.ID);
        res.send('Problem deleted');
    }
    catch (err) {
        console.log("Failed to delete problem");
    }
});


app.get('/problemset', async (req, res) => {
    try {
        const allproblems = await Problem.find();
        const visibleprobs = allproblems.filter((ele) =>
            (new Date().getTime() > (new Date(ele.availableFrom).getTime() + ele.duration * 60000))
        )
        res.send(JSON.stringify(
            visibleprobs.map(prob => ({
                title: prob.title,
                rating: prob.rating,
                author: prob.author,
                total_submissions: prob.total_submissions,
                total_accepted: prob.total_accepted
        }))));
    } catch (err) {
        console.log("Failed to get problemset");
        res.status(500).send('Internal Server Error');
    }
});

app.put('/update/:ID', async (req, res) => {
    try {
        const userAuth = await User.findOne({ userid: req.body.userid });
        if (!userAuth || !userAuth.isAdmin) {
            return res.status(401).send('Unauthorized');
        }
        const prob = await Problem.findByIdAndUpdate(req.params.ID, req.body, { new: true });
        res.send('Problem updated');
    }
    catch (err) {
        console.log("error updating problem");
    }
}
);

app.get('/problem/:title', async (req, res) => {
    try {
       
        const title = req.params.title;
        const newtitle = title.split('-').join(' ');
        const details = await Problem.findOne({ 'title': newtitle });
        if (!details || new Date().getTime() < new Date(details.availableFrom).getTime()) {
            res.status(404).send('Problem not found');
        }
     
        res.send(JSON.stringify(
            {
                "title": details.title,
                "question": details.question,
                "constraints": details.constraints,
                "solved_TC_input": details.solved_TC_input,
                "solved_TC_output": details.solved_TC_output,
                "rating": details.rating,
                "inputFormat": details.inputFormat,
                "outputFormat": details.outputFormat,
                "total_submissions": details.total_submissions,
                "total_accepted": details.total_accepted,
                "author": details.author,
                "_id":details._id
            }
        ));
    } catch (err) {
        console.log("error getting problem by title");
    }
});

app.post('/allsubproblem', async (req, res) => {
    const probName = req.body.problemName.split('-').join(' ')
    const user = await User.findOne({ userid: req.body.userID })
    if (!user) {
        return res.status(404).send('user not found')
    }
    const submissions = await Submission.find({ problemName: probName })
    const problem = await Problem.findOne({ title: probName })
    if (!problem) {
        return res.status(404).send('problem not found')
    }
    if (new Date().getTime() > (new Date(problem.availableFrom).getTime() + problem.duration * 60000)) {
        res.send(submissions.reverse()); return
    }
    const mysub = submissions.filter((ele) => ele.userName == user.name)
    res.send(mysub.reverse());
})

module.exports = app;