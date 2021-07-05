const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

//connect db
connectDB()

app.use(express.json({ extended: true }))
app.use(cors())
app.use(express.urlencoded())


app.get('/', (req, res) => {
    res.send("running")
})

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`success! running on ${PORT}`))