const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
    },
    userid: {
        type: String,
        required: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    contest_rating: {
        type: Number,
        default: 0
    },
    max_contest_rating: {
        type: Number,
        default: 0
    },
    contest_participated: {
        type: Number,
        default: 0
    },
    problems_submitted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
    }],
    profile_pic: {
        type: String,
        default: "http://www.gravatar.com/avatar/?d=mp"
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;