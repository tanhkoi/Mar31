const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const {
  check_authentication,
  check_authorization,
} = require("../middleware/check_auth");
const constants = require("../middleware/constants");

// Get all users with filters (Only MODs and above)
router.get(
  "/",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async (req, res) => {
    try {
      const { username, fullName, minLogin, maxLogin } = req.query;
      let filter = { status: true };
      if (username) filter.username = { $regex: username, $options: "i" };
      if (fullName) filter.fullName = { $regex: fullName, $options: "i" };
      if (minLogin || maxLogin) {
        filter.loginCount = {};
        if (minLogin) filter.loginCount.$gte = parseInt(minLogin);
        if (maxLogin) filter.loginCount.$lte = parseInt(maxLogin);
      }
      const users = await User.find(filter).populate("role");
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get user by ID (except their own)
router.get(
  "/:id",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async (req, res) => {
    try {
      if (req.user.id === req.params.id) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You cannot view your own account.",
          });
      }
      const user = await User.findById(req.params.id).populate("role");
      if (!user || !user.status) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Create a new user (Only Admin)
router.post(
  "/",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      const newUser = new User({
        username,
        email,
        password,
        role: role || "user",
      });
      await newUser.save();
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update user (Only Admin)
router.put(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async (req, res) => {
    try {
      let user = await User.findById(req.params.id);
      if (!user || !user.status) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      Object.assign(user, req.body);
      await user.save();
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Soft delete user (Only Admin)
router.delete(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async (req, res) => {
    try {
      let user = await User.findById(req.params.id);
      if (!user || !user.status) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      user.status = false;
      await user.save();
      res.status(200).json({ success: true, message: "User soft deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
