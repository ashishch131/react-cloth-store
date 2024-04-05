const router = require("express").Router();
const verify = require("./verifyToken");
const Cart = require("../models/Cart");

//Create Cart//
router.post("/", verify, async (req, res) => {

    const newCart = new Cart(req.body);
    try {
      const cart = await newCart.save();
      res.status(201).json(cart);
    } catch (error) {
      res.status(500).json(error);
    }

});

//Update Cart//
router.put("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      const updateCart = await Cart.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.status(200).json(updateCart);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Delete Cart//
router.delete("/:id", verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await Cart.findByIdAndDelete(req.params.id);

      res.status(200).json("Cart has been deleted");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Get user Cart//
router.get("/find/:userId", verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
  try {
      const cart = await Cart.findOne({userId: req.params.userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json(error);
        }
    } else {
        res.status(401).json("not authenticated");
      }
});

//Get all Cart//
router.get("/",verify, async (req, res) => {
    if (req.user.isAdmin) {
        try {
            const carts = await Cart.find();
          res.status(200).json(carts);
        } catch (error) {
          res.status(500).json(error);
              }
          } else {
              res.status(401).json("not authenticated");
            }
});

module.exports = router;
