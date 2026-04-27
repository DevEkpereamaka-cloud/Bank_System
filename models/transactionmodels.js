import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    senderAccountNumber: {
      type: String,
      required: true,
    },
    recipientAccountNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Intra-Bank", "Inter-Bank"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    naration: {
      type: String,
    },
    referenceId: {
      type: String,
    },
  },
  { timestamps: true },
);
export default mongoose.model("Transactions", transactionSchema);
