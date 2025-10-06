const express = require("express");
const router = express.Router();
const { register, loginUser, promoteUser, sendCustomEmail } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", loginUser);
router.put("/promote", promoteUser);
router.post("/send-email", sendCustomEmail);

module.exports = router;
