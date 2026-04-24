import mongoose from "mongoose";
import dotenv from "dotenv";
const bankUserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: true,
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
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    passcode: {
      type: String,
      reguired: true,
      minlength: 3,
    },
    pin: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{4}$/.test(v);
        },
      },
    },
    verificationMethod: {
      type: String,
      enum: ["BVN", "NIN", null],
      default: null,
    },
    verificationId: {
      type: String,
      required: true,
      default: null,
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    bankName: {
      type: String,
      default: process.env.NIBSS_BANK_NAME,
    },
  },
  { timestamps: true },
);
export default mongoose.model(bank_Users, bankUserSchema);
