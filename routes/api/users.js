const express = require("express")
const router = express.Router()
const Profile = require("../../models/Profile")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { check, validationResult } = require('express-validator');

const User = require("../../models/User")

// @route post api/users
// @desc register user

router.post("/", [
    check('username', 'username is required').not().isEmpty(),
    check('email', 'please include valid email').isEmail(),
    check('password', 'Password must have 6 or more character').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    try {
        let user = await User.findOne({ email })
        if (user) {
            res.status(400).json({ message: "User already exist" })
        }

        user = new User({ username, email, password })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)


        await user.save()


        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token })
            }
        )

    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})


module.exports = router