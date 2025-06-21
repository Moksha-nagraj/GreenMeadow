// server/routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");

// Public routes
router.post("/login", userController.login);
router.post("/register", userController.register);

// Unprotected routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/change-password", userController.changePassword);

module.exports = router;
