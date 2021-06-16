const express = require("express")
const Profile = require("../../models/Profile")
const User = require("../../models/User")
const router = express.Router()
const auth = require("../../middleware/auth")
const { check, validationResult } = require("express-validator")



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

    const { bio, birthdate, location, website, profilePic, coverPic } = req.body
    console.log(req.user)
    const profileFields = {}
    profileFields.user = req.user.id
    if (bio) profileFields.bio = bio
    if (birthdate) profileFields.birthdate = birthdate
    if (location) profileFields.location = location
    if (website) profileFields.website = website
    if (profilePic) profileFields.profilePic = profilePic
    if (coverPic) profileFields.coverPic = coverPic

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
        if (!profile) {
            res.status(400).json({ msg: "profile not found" })
        }
        res.json(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error')
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