import mongoose from "mongoose";
import dotenv from "dotenv";
const bankUserSchema = mongoose.Schema(
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
  },
  { timestamps: true },
);
export default mongoose.model("bank_Users", bankUserSchema);
