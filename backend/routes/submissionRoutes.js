const express = require('express');
const { createFilepath } = require('../createFilepath');
const User = require('../models/userModel');
const Problem = require('../models/problemModel');
const { executeCode } = require('../executeCode');
const Submission = require('../models/submissionModel');
const Contest = require('../models/contestModel');
const app = express();

const createSubmission = async (problem, problemName, contestID, username, user, code, language, verdict) => {
    const submission = new Submission({ problem, problemName, contest: contestID, userName: username, user, code, language, verdict })
    await submission.save()
    if (contestID) {//sort here the leaderboard
        const contest = await Contest.findById(contestID)
        const problems = contest.problems
        let i;
        const len = problems.length
        for (i = 0; i < len; i++) {
            if (problems[i]._id.equals(problem)) break;
        }
        const indiproblem = await Problem.findById(problem)
        let ispresent = 0;
        contest.submissions.push(submission._id)

        let newleaderboard = contest.leaderboard.map((ele, ind) => {
            if (ele.userName == username) {
                ispresent = 1
                ele.numTried[i] = ele.numTried[i] + 1;
                if (verdict == 'Accepted\n' || ele.isAccepted[i] == true) {
                    if (!ele.isAccepted[i]) {
                        ele.globalRank[i] = contest.correctSubmissions[i] + 1;
                        contest.correctSubmissions[i] = contest.correctSubmissions[i] + 1;
                    }
                    ele.isAccepted[i] = true;
                    const timepassedinmins = (new Date().getTime() - new Date(contest.start_time).getTime()) / 60000
                    ele.maxRating = Math.max(ele.maxRating, Math.floor(indiproblem.rating - timepassedinmins / contest.duration * 100 - ele.penalty / 300 * 50))
                    // console.log(ele.maxRating, Math.floor(indiproblem.rating - timepassedinmins / contest.duration * 100 - ele.penalty / 300 * 50), indiproblem.rating, timepassedinmins / contest.duration * 100, ele.penalty / 300 * 50)
                } else {
                    ele.penalty = ele.penalty + 50;
                }
            }
            return ele;
        })
        contest.numSubmissions[i] = contest.numSubmissions[i] + 1;
        if (ispresent == 0) {
            newleaderboard.push({ userName: username, numTried: new Array(len).fill(0), isAccepted: new Array(len).fill(false), globalRank: new Array(len).fill(0), maxRating: 0, penalty: 0 })
            newleaderboard[newleaderboard.length - 1].numTried[i] = 1;
            if (verdict == 'Accepted\n') {
                newleaderboard[newleaderboard.length - 1].isAccepted[i] = true;
                newleaderboard[newleaderboard.length - 1].globalRank[i] = contest.correctSubmissions[i] + 1;
                contest.correctSubmissions[i] = contest.correctSubmissions[i] + 1;
                const timepassedinmins = (new Date().getTime() - new Date(contest.start_time).getTime()) / 60000
                newleaderboard[newleaderboard.length - 1].maxRating = Math.floor(indiproblem.rating - timepassedinmins / contest.duration * 100 - newleaderboard[newleaderboard.length - 1].penalty / 300 * 50)
                // console.log("first time rating, ", Math.floor(indiproblem.rating - timepassedinmins / contest.duration * 100 - newleaderboard[newleaderboard.length - 1].penalty / 300 * 50))
            } else {
                newleaderboard[newleaderboard.length - 1].penalty = 50;
            }
        }

        newleaderboard.sort((a, b) => {
            return b.maxRating - a.maxRating
        })
        contest.leaderboard = newleaderboard;
        await contest.save()
    }
    return submission._id
}

app.post('/run', async (req, res) => {
    try {
        const lang = req.body.lang;
        const code = req.body.code;
        const input = req.body.input;
        const contestName = req.body?.contestName;
        let contest = null;
        if (contestName) {
            try {
                contest = await Contest.findOne({ title: contestName.split('-').join(' ') })
                if ((new Date(contest?.start_time).getTime() + contest?.duration * 60000) < (new Date().getTime()) || new Date(contest?.start_time).getTime() > new Date().getTime()) {
                    contest = null
                    // console.log("contest over or not started")
                }
            } catch (err) {
                console.log("contest not found", err)
                res.status(404).send('contest not found');
                return
            }
        }
        if (!req.body.lang || !req.body.code || !req.body.probID || !req.body.userID) {
            res.status(400).send('Information missing while running code'); return
        }
        const isSubmit = req.body.isSubmit || false
        const userinfo = await User.findOne({ userid: req.body.userID })
        if (!userinfo) {
            res.status(404).send('unauthorized user'); return
        }
        const problem = await Problem.findById(req.body.probID)
        if (!problem) {
            res.status(404).send('problem not found'); return
        }

        if (!isSubmit) {
            const { filePath, dirCodes } = await createFilepath(lang, code, userinfo.name, problem.title)
            const answer = await executeCode(filePath, dirCodes, input, userinfo.name, lang, -1)
            res.send({ answer });
        } else {
            const { filePath, dirCodes } = await createFilepath(lang, code, userinfo.name, problem.title)
            const len = problem.allTCarr.length
            let pass = 0
            for (let i = 0; i < len; i++) {
                const input = problem.allTCarr[i]
                const output = problem.allCorrectSolnArr[i]
                const answer = await executeCode(filePath, dirCodes, input, userinfo.name, lang, i)

                if (answer?.trim() != output?.trim()) {
                    problem.total_submissions = problem.total_submissions + 1
                    await problem.save()
                    const sub = await createSubmission(problem._id, problem.title, contest?._id, userinfo.name, userinfo._id, code, lang, 'Wrong Answer on TC ' + (pass + 1) + '\nWrong TestCase: \n' + problem.allTCarr[pass] + '\nYour output:\n' + answer + '\nCorrect output:\n' + output)
                    if (!contest)
                        userinfo.problems_submitted.push(sub)
                    await userinfo.save()
                    return res.send({ wrongTC: problem.allTCarr[pass], Wooutput: answer, Coutput: output, pass, isCorrect: false });
                } else pass++
            }
            problem.total_accepted = problem.total_accepted + 1
            problem.total_submissions = problem.total_submissions + 1
            await problem.save()
            const sub = await createSubmission(problem._id, problem.title, contest?._id, userinfo.name, userinfo._id, code, lang, 'Accepted\n')
            if (!contest)
                userinfo.problems_submitted.push(sub)
            await userinfo.save()
            return res.send({ isCorrect: true });
        }
    } catch (error) {
        try {
            const error2 = error?.toString().substring(7)
            const isSubmit = req.body.isSubmit || false
            const userinfo = await User.findOne({ userid: req.body.userID })
            if (!userinfo) {
                res.status(404).send('unauthorized user');
            }
            let err = ""
            if (error2?.includes('_' + userinfo.name + '-')) {
                err = 'Compilation Error \n' + error2
            } else if (error2?.includes('Time Limit Exceeded')) {
                err = 'Time Limit Exceeded \n' + error2
            } else if (error2?.includes('Memory Limit Exceeded')) {
                err = 'Memory Limit Exceeded \n' + error2
            }
            else {
                err = 'Segmentation fault \n' + error2
            }
            console.log(error2)
            if (isSubmit) {
                const lang = req.body.lang;
                const code = req.body.code;
                const input = req.body.input;
                const contestName = req.body?.contestName;
                let contest = null;
                if (contestName) {
                    contest = await Contest.findOne({ title: contestName.split('-').join(' ') })
                    if ((new Date(contest?.start_time).getTime() + contest?.duration * 60000) < (new Date().getTime()) || new Date(contest?.start_time).getTime() > new Date().getTime()) {
                        contest = null
                        // console.log("contest over or not started")
                    }
                }
                const problem = await Problem.findById(req.body.probID)
                if (!problem) {
                    res.status(404).send('problem not found'); return
                }

                problem.total_submissions = problem.total_submissions + 1
                await problem.save()
                const sub = await createSubmission(problem._id, problem.title, contest?._id, userinfo.name, userinfo._id, code, lang, err)
                if (!contest)
                    userinfo.problems_submitted.push(sub)
                await userinfo.save()
            }
            return res.status(500).send(err);
        } catch (err) {
            console.log("mistake in main catch", err)
        }
    }
});

// app.post('/profile', async (req, res) => {
//     const user = await User.findOne({ userid: req.body.userID })
//     if (!user) {
//         return res.status(404).send('user not found')
//     }
//     const submissions = await Submission.find({ user: user._id })
//     res.send(submissions)
// })

// not used in this project 
// app.post('/mysubproblem', async (req, res) => {
//     const user = await User.findOne({ userid: req.body.userID })
//     if (!user) {
//         return res.status(404).send('user not found')
//     }
//     const submissions = await Submission.find({ user: user._id })
//     const mysub = submissions.filter((ele) => ele.problemName == req.body.problemName.split('-').join(' '))
//     res.send(mysub)
// })

module.exports = app;