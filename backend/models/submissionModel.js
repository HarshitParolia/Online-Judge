const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest",
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    problemName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    verdict: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;

