const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { check, validationResult } = require('express-validator');

const auth = require("../../middleware/auth")
const User = require("../../models/User")

// @route GET api/auth

router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.status(200).json(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('server error')
    }
})

// @route post api/auth
// @desc login user

router.post("/", [
    check('email', 'please include valid email').isEmail(),
    check('password', 'Password is invalid').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
        let user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ message: "user does not exist" })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] })
        }


        const payload = {
            user: {
                id: user.id
            }
        }
        user = await User.findOne({ email }).select('-password')
        jwt.sign(payload, config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ user: user, token: token })
            }
        )

    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})



module.exports = router