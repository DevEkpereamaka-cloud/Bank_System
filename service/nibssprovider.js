import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export const verifyUserIdentity = async (type, number) => {
  try {
    const isBvn = type.toUpperCase() === "BVN";
    const endpoint = isBvn ? "validateBvn" : "validateNin";
    const payload = isBvn ? { bvn: number } : { nin: number };
    const response = await axios.post(
      `${process.env.NIBSS_BASE_URL}${endpoint}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw new Error(error.response?.data?.message || "Verification Failed");
  }
};
export const nibssClient = axios.create({
  baseURL: process.env.NIBSS_BASE_URL,
});
export const getNibssToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.NIBSS_BASE_URL}auth/token`,
      {
        apiKey: process.env.NIBSS_API_KEY,
        apiSecret: process.env.NIBSS_API_SECRET,
      },
    );
    return response.data.token;
  } catch (error) {
    console.error({
      "Nibss Token Error": error.response?.data || error.message,
    });
    throw new Error(
      error.response?.data?.message || "Sorry couldn't get token from nibs",
    );
  }
};
export default nibssClient;
