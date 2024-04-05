const router = require("express").Router();
const verify = require("./verifyToken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

//Updater user
router.put("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);

      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("you are not authenticated!");
  }
});

//Delete user
router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted!");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("you are not authenticated!");
  }
});

//Get a user//

router.get("/find/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      const { password, ...other } = user._doc;
      res.status(200).json(other);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("you are not authenticated!");
  }
});

//Get all users with query//

router.get("/", verify, async (req, res) => {
  const query = req.query.new;
  if (req.user.isAdmin) {
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("you are not authenticated!");
  }
});

//Get User Stats

router.get("/stats", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
      const data = await User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        { $project: { month: { $month: "$createdAt" } } },
        { $group: { _id: "$month", total: { $sum: 1 } } },
      ]);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("you are not authenticated!");
  }
});
module.exports = router;
