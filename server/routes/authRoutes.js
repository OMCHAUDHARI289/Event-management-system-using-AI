const express = require("express");
const { registerUser, loginUser, updateRole } = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/role", updateRole); // only admin should access this later

module.exports = router;
