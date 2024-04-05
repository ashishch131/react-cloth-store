const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Register user//
router.post("/register", async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
    })
    try {
       const user = await newUser.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
});

//Login user//

router.post("/login", async (req, res) => {
    try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("wrong username");
    
    const valid = await bcrypt.compare(req.body.password, user.password);
        !valid && res.status(401).json("wrong password");

        const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SEC, { expiresIn: "5d" });

        const { password, ...other } = user._doc;
        res.status(200).json({ other, accessToken});
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
