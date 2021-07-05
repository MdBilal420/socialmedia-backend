const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    bio: {
        type: String,
    },
    birthdate: {
        type: Date
    },
    location: {
        type: String,
    },
    website: {
        type: String
    },
    followers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    following: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
})

module.exports = mongoose.model('profile', ProfileSchema)