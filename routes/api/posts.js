const express = require("express")
const router = express.Router()
const Post = require("../../models/Post")
const Profile = require("../../models/Profile")
const User = require("../../models/User")
const auth = require("../../middleware/auth")
const { check, validationResult } = require("express-validator")


// @route POST api/posts
// @desc Create Post
router.post("/", [
    auth,
    [check('text', 'Text is required').not().isEmpty()]
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')
        const newPost = new Post({
            text: req.body.text,
            username: user.username,
            user: req.user.id
        })
        const post = await newPost.save()

        res.json(post)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ msg: 'Server Error' })
    }

    res.send('posts route')
})


// @route GET api/posts
// @desc GET all posts 

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('server error')
    }
})


// @route GET api/posts/:id
// @desc GET post by ID 

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ msg: 'post not found' })
        }
        res.json(post)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('server error')
    }
})


// @route DELETE api/posts/:id
// @desc DELETE post by ID 

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        //check user
        if (post.user.toString() !== req.user.id) {
            return res.status(500).json({ msg: "User not authorised" })
        }
        await post.remove()
        res.json({ postId: req.params.id, msg: "post removed" })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('server error')
    }
})


// @route PUT api/posts/like/:id
// @desc Like a post

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        // check like status
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "post already liked" })
        }

        post.likes.unshift({ user: req.user.id })
        await post.save()

        res.status(200).json(post)


    } catch (error) {
        console.error(error.message)
        re.status(500).send('server error')
    }
})

// @route PUT api/posts/unlike/:id
// @desc Unlike a post

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        // check like status
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: "post is not liked yet" })
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)

        await post.save(

            res.status(200).json(post)
        )

    } catch (error) {
        console.error(error.message)
        re.status(500).send('server error')
    }
})


// @route POST api/posts/comment/:id
// @desc Create Comment

router.post("/comment/:id", [
    auth,
    [check('text', 'Text is required').not().isEmpty()]
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)

        const newComment = {
            text: req.body.text,
            username: user.username,
            user: req.user.id
        }

        post.comments.unshift(newComment)

        await post.save()

        res.status(200).json(post.comments)
    }
    catch (error) {
        console.log(error.message)
        res.status(500).json({ msg: 'Server Error' })
    }

    res.send('posts route')
})


// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete Comment

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)

        const comment = post.comments.find(comment => comment.id === req.params.comment_id)

        if (!comment) {
            res.status(400).json({ msg: 'commnent does not exist' })
        }

        if (comment.user.toString() !== req.user.id) {
            res.status(401).json({ msg: 'unauthorized ' })
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)

        post.comments.splice(removeIndex, 1)

        await post.save()

        res.json(post.comments)

    }
    catch (error) {
        console.log(error.message)
        res.status(500).json({ msg: 'Server Error' })
    }
})


module.exports = router