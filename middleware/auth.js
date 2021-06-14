const jwt = require("jsonwebtoken")
const config = require("config")

const auth = (req, res, next) => {
    const token = req.headers.authorization

    if (!token) {
        res.status(401).json({ msg: "no authorization" })
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user
        next();

    } catch (error) {
        console.log(error.message)
        res.status(401).json({ msg: "No token" })
    }
}

module.exports = auth