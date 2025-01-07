// import express from "express";
// import { login, signup } from "../controllers/authController.js";

// const router = express.Router();

// // User authentication routes
// router.post("/signup", signup);
// router.post("/login", login);

// export default router;

const express = require("express");
const { signUp, logIn } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);

module.exports = router;
