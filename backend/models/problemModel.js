const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    constraints: {
        type: String,
        required: true
    },
    solved_TC_input: {
        type: String
    },
    solved_TC_output: {
        type: String
    },
    allTCarr: [{
        type: String
    }],
    allCorrectSolnArr: [{
        type: String
    }],
    rating: {
        type: Number,
        required: true
    },
    inputFormat: {
        type: String,
        required: true
    },
    outputFormat: {
        type: String,
        required: true
    },
    total_submissions: {
        type: Number,
        default: 0
    },
    total_accepted: {
        type: Number,
        default: 0
    },
    author: {
        type: String,
        required: true
    },
    availableFrom: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;