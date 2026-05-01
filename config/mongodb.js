import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async () => {
  try {
    console.log(process.env.MONGODB);
    await mongoose.connect(process.env.MONGODB);
    console.log("Connected to database ");
  } catch (error) {
    console.error(` Error!! Connection to database lost ${error}`);
  }
};
