const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    profilename: {
        type: String,
        required: true,
        unique: true
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
    profilePic: {
        type: String
    },
    coverPic: {
        type: String
    }
})

module.exports = mongoose.model('profile', ProfileSchema)