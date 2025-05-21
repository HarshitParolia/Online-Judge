const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    }],
    start_time: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
    }],
    numSubmissions: [{
        type: Number,
        default: 0
    }],
    correctSubmissions: [{
        type: Number,
        default: 0
    }],
    leaderboard: [{
        userName: {
            type: String,
            required: true
        },
        penalty: {
            type: Number,
            default: 0
        },
        numTried: [{
            type: Number,
            default: 0
        }],
        isAccepted: [{
            type: Boolean,
            default: false
        }],
        globalRank: [{
            type: Number,
            default: 0
        }],
        maxRating: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
});

const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest;