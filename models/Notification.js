const mongoose = require('mongoose')

const NotificationSchema = mongoose.Schema({

    notificationType: {
        type: String,
        enum: ["LIKE", "FOLLOW"],
    },

    time: {
        type: Date
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },

    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        populate: {
            select: 'username'
        }
    },

    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        populate: {
            select: 'username'
        }
    }
})

module.exports = mongoose.model('notification', NotificationSchema)
