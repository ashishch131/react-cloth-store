const router = require("express").Router();
const verify = require("./verifyToken");
const Order = require("../models/Order");

//Create Order//
router.post("/", verify, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Update Order//
router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updateOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.status(201).json(updateOrder);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Delete Order//
router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await Order.findByIdAndDelete(req.params.id);

      res.status(200).json("Order has been deleted");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Get user Orders//
router.get("/find/:userId", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      const order = await Order.findOne({ userId: req.params.userId });
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Get all Cart//
router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Get Monthly income//

router.get("/income", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const prevMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
      const income = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: prevMonth },
          },
        },

        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales" },
          },
        },
      ]);
      res.status(200).json(income);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

module.exports = router;
