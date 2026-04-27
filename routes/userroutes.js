import express from "express";
import {
  createUser,
  nameEnquiry,
  initiateTransfer,
  getTransactionStatus,
  getAccountBallance,
  getMyTransactionHistory,
} from "../controller/bankUsercontroller.js";
const router1 = express.Router();
router1.post("/izibank/user/join", createUser);
router1.get("/izibank/user/enquiry/:accountNumber", nameEnquiry);
router1.get("/izibank/user/transfer", initiateTransfer);
router1.get("/izibank/user/transaction", getTransactionStatus);
router1.get("/izibank/user/balance/:accountNumber", getAccountBallance);
router1.get("/izibank/user/history/:accountNumber", getMyTransactionHistory);
export default router1;
