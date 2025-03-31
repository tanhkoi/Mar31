var express = require("express");
var router = express.Router();
let productSchema = require("../schemas/product");
let categorySchema = require("../schemas/category");
const {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
const constants = require("../utils/constants");

function BuildQuery(query) {
  let result = {};
  if (query.name) {
    result.name = new RegExp(query.name, "i");
  }
  result.price = {};
  if (query.price) {
    result.price.$gte = Number(query.price.$gte) || 0;
    result.price.$lte = Number(query.price.$lte) || 10000;
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

router.get("/", async function (req, res) {
  let products = await productSchema.find(BuildQuery(req.query)).populate({
    path: "category",
    select: "name",
  });
  res.status(200).send({ success: true, data: products });
});

router.get("/:id", async function (req, res) {
  try {
    let product = await productSchema.findById(req.params.id);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

router.post(
  "/",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async function (req, res) {
    try {
      let body = req.body;
      let category = await categorySchema.findOne({ name: body.category });
      if (!category)
        return res
          .status(404)
          .send({ success: false, message: "Category not found" });

      let newProduct = new productSchema({
        name: body.name,
        price: body.price || 0,
        quantity: body.quantity || 0,
        category: category._id,
      });
      await newProduct.save();
      res.status(200).send({ success: true, data: newProduct });
    } catch (error) {
      res.status(404).send({ success: false, message: error.message });
    }
  }
);

router.put(
  "/:id",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async function (req, res) {
    try {
      let product = await productSchema.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .send({ success: false, message: "Product not found" });

      Object.assign(product, req.body);
      await product.save();
      res.status(200).send({ success: true, data: product });
    } catch (error) {
      res.status(404).send({ success: false, message: error.message });
    }
  }
);

router.delete(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res) {
    try {
      let product = await productSchema.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .send({ success: false, message: "Product not found" });

      product.isDeleted = true;
      await product.save();
      res.status(200).send({ success: true, data: product });
    } catch (error) {
      res.status(404).send({ success: false, message: error.message });
    }
  }
);

module.exports = router;
