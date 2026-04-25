import userModels from "../models/bankusermodels.js";
import nibssClient, {
  verifyUserIdentity,
  getNibssToken,
} from "../service/nibssprovider.js";
import bcrypt from "bcrypt";
import { generateUniqueAccountNumber } from "../utils/uniquegen.js";
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
      dob,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !verificationMethod ||
      !verificationId ||
      !passcode ||
      !pin ||
      !email ||
      !dob
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
    const nibssData = await verifyUserIdentity(
      verificationMethod,
      verificationId,
    );
    if (
      firstName.toLowerCase() !== nibssData.firstName.toLowerCase() ||
      lastName.toLowerCase() !== nibssData.toLowerCase() ||
      dob !== nibssData.dob
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Credentials don't match" });
    }
    const token = await getNibssToken();
    const nibssResponse = await nibssClient.post(
      "/account/create",
      {
        kycType: verificationMethod,
        kycID: verificationId,
        dob: dob,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const accountNumber = await generateUniqueAccountNumber();
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);
    const hashedPasscode = await bcrypt.hash(passcode, salt);
    const newUser = await userModels.create({
      firstName,
      lastName,
      email,
      phone,
      passcode: hashedPasscode,
      pin: hashedPin,
      isVerified: true,
      verificationMethod,
      verificationId,
      accountNumber,
      accountBalance: 15000,
    });
    res
      .status(200)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    res.status(400).json({ Error_located: error.message });
  }
};
