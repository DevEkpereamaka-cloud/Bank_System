import mongoose from "mongoose";
import dotenv from "dotenv";
const bankUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    dob: {
      type: String,
      trim: true,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    passcode: {
      type: String,
      required: true,
      minlength: 3,
    },
    pin: {
      type: String,
      required: true,
    },
    verificationMethod: {
      type: String,
      enum: ["bvn", "nin"],
      required: true,
    },
    verificationId: {
      type: String,
      required: true,
      default: null,
    },
    accountNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    accountBalance: {
      type: Number,
      default: 0,
    },

    bankName: {
      type: String,
      default: process.env.NIBSS_BANK_NAME,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);
export default mongoose.model("bank_Users", bankUserSchema);
