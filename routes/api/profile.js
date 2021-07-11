const express = require("express")
const Profile = require("../../models/Profile")
const User = require("../../models/User")
const Notification = require("../../models/Notification")
const router = express.Router()
const auth = require("../../middleware/auth")
const { check, validationResult } = require("express-validator")

const Post = require("../../models/Post")

// @route GET api/profile
// @desc get current users profile

router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['username'])
        if (!profile) {
            return res.status(400).json({ msg: 'Profile does not exist' })
        }
        res.json(profile)

    } catch (error) {
        console.log(error.message)
        res.status(500).send('server error')
    }
})


// @route Post api/profile
// @desc create or update profile

router.post("/", [
    check('bio', 'Bio cannot be empty')
], auth, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { bio, birthdate, location, website } = req.body
    const profileFields = {}
    profileFields.user = req.user.id
    if (bio) profileFields.bio = bio
    if (birthdate) profileFields.birthdate = birthdate
    if (location) profileFields.location = location
    if (website) profileFields.website = website

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            )
            return res.json(profile)
        }

        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('server error')
    }
})


// @route GET api/profile
// @desc get all profiles

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['username'])
        res.json(profiles)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error')
    }
})

// @route GET api/profile/user/:user_id
// @desc get profile by id

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['username'])
        const posts = await Post.find().sort({ date: -1 })
        if (!profile) {
            res.status(400).json({ msg: "profile not found" })
        }

        var x = posts.filter((post) => post.user == req.params.user_id)
        res.json({ profile: profile, posts: x })

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error')
    }
})


// @route PUT api/profile/follow/:id
// @desc follow a profile

router.put('/follow/:id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.id }).populate('user', ['username'])

        const profile2 = await Profile.findOne({ user: req.user.id }).populate('user', ['username'])

        if (profile.followers.filter(profile => profile.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "profile already followed" })
        }

        profile2.following.unshift({ user: profile.user._id, username: profile.user.username })
        profile.followers.unshift({ user: profile2.user._id, username: profile2.user.username })
        await profile.save()
        await profile2.save()

        try {
            const notification = {
                notificationType: "FOLLOW",
                time: new Date(),
                toUser: req.params.id,
                fromUser: req.user.id,
            }
            Notification.create(notification);
        } catch (error) {
            console.log(error);
        }

        res.status(200).json({ profile, profile2 })

    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

// @route PUT api/profile/unfollow/:id
// @desc Unfollow a profile

router.put('/unfollow/:id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.id })
        const profile2 = await Profile.findOne({ user: req.user.id })

        if (profile.followers.filter(follower => follower.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: "profile is not followed yet" })
        }

        const removeIndex1 = profile.followers.map(follower => follower.user.toString()).indexOf(req.user.id)
        const removeIndex2 = profile2.following.map(follower => follower.user.toString()).indexOf(req.params.id)


        profile.followers.splice(removeIndex1, 1)
        profile2.following.splice(removeIndex2, 1)


        await profile.save()
        await profile2.save()

        res.status(200).json({ profile, profile2 })

    } catch (error) {
        console.error(error.message)
        re.status(500).send('server error')
    }
})

// @route DELETE api/profile
// @desc delete profile, user & posts

router.delete('/', auth, async (req, res) => {

    try {
        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id })
        // remove user
        await User.findOneAndRemove({ _id: req.user.id })

        res.json({ msg: "user deleted successfully" })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error')
    }

})

module.exports = router