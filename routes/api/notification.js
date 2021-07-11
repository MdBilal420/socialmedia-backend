const express = require('express')
const auth = require("../../middleware/auth")
const Notification = require('../../models/Notification')
const router = express.Router()

router.get('/:id', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ toUser: req.params.id })
            .sort({ time: 'desc' })
            .populate('fromUser')
            .populate('toUser')
        res.status(201).json({ notifications });
    } catch (error) {
        console.log(error);
        res.status(404).json({ success: false })
    }
})

module.exports = router