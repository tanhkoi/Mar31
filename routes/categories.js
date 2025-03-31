var express = require("express");
var router = express.Router();
let categorySchema = require("../schemas/category");
const {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
const constants = require("../utils/constants");

router.get("/", async function (req, res) {
  let categories = await categorySchema.find({});
  res.status(200).send({ success: true, data: categories });
});

router.get("/:id", async function (req, res) {
  try {
    let category = await categorySchema.findById(req.params.id);
    res.status(200).send({ success: true, data: category });
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
      let newCategory = new categorySchema({ name: req.body.name });
      await newCategory.save();
      res.status(200).send({ success: true, data: newCategory });
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
      let category = await categorySchema.findById(req.params.id);
      if (!category)
        return res
          .status(404)
          .send({ success: false, message: "Category not found" });

      category.name = req.body.name;
      await category.save();
      res.status(200).send({ success: true, data: category });
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
      let category = await categorySchema.findById(req.params.id);
      if (!category)
        return res
          .status(404)
          .send({ success: false, message: "Category not found" });

      category.isDeleted = true;
      await category.save();
      res.status(200).send({ success: true, data: category });
    } catch (error) {
      res.status(404).send({ success: false, message: error.message });
    }
  }
);

module.exports = router;
