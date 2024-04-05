const router = require("express").Router();
const verify = require("./verifyToken");
const Product = require("../models/Product");

//Create Product//
router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newProduct = new Product(req.body);
    try {
      const product = await newProduct.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Update Product//
router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updateProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.status(201).json(updateProduct);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Delete Product//
router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await Product.findByIdAndDelete(req.params.id);

      res.status(200).json("product has been deleted");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("not authenticated");
  }
});

//Get a Product//
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get all Product//
router.get("/", async (req, res) => {
  qNew = req.query.new;
  qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: { $in: [qCategory] },
      });
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
