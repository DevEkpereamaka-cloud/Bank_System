import express from "express";
import { createUser } from "../controller/bankUsercontroller.js";
const router1 = express.Router();
router1.post("/izibank/user/join", createUser);
export default router1;
