import userModels from "../models/bankusermodels.js";
import { verifyUserIdentity } from "../utils/nibssprovider";
import bcrypt from "bcrypt";
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      verificationMethod,
      verificationId,
      passcode,
      pin,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !verificationMethod ||
      !verificationId ||
      !passcode ||
      !pin ||
      !email
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Please provide valid informations" });
    }
    const existingEmail = await userModels.findOne({ email });
    const existingPhone = await userModels.findOne({ phone });
    if (existingEmail || existingPhone) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }
    await verifyUserIdentity(verificationMethod, verificationId);
    const accNumber = Math.floor(
      1000000000 + Math.random() * 9000000000,
    ).toString();
  } catch (error) {}
};
