import { connectDB } from "./config/mongodb.js";
import express from "express";
import dotenv from "dotenv";
import router1 from "./routes/userroutes.js";
dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(router1);
app.listen(process.env.PORT, () => {
  console.log(`Server is up and running at PORT ${process.env.PORT}`);
});
