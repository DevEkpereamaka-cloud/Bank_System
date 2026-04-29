import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  createUser,
  loginUser,
  nameEnquiry,
  initiateTransfer,
  getTransactionStatus,
  getAccountBallance,
  getMyTransactionHistory,
  getMyIdentity,
} from "../controller/bankUsercontroller.js";
import { loginLimiter } from "../middleware/ratelimiter.js";
const router1 = express.Router();
router1.post("/izibank/user/join", createUser);
router1.post("/izibank/user/login", loginLimiter, loginUser);
router1.post("/izibank/user/transfer", protect, initiateTransfer);
router1.post("/izibank/user/enquiry", protect, nameEnquiry);
router1.post("/izibank/user/transaction", protect, getTransactionStatus);
router1.get("/izibank/user/balance", protect, getAccountBallance);
router1.get("/izibank/user/history", protect, getMyTransactionHistory);
router1.get("/izibank/user/identity", protect, getMyIdentity);
export default router1;
