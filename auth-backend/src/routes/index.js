const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoute");
const userRoutes = require("./userRoute");
const adminRoutes = require("./adminRoutes");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
