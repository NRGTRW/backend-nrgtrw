import express from "express";
import { getItems } from "../controllers/itemController.js";

const router = express.Router();

router.get("/items", getItems);

export default router;
