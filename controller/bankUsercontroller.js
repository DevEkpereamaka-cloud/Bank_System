import userModels from "../models/bankusermodels.js";
import jwt from "jsonwebtoken";
import transactionmodels from "../models/transactionmodels.js";
import { sendWelcomeEmail } from "../utils/emailservice.js";
import nibssClient, {
  verifyUserIdentity,
  getNibssToken,
} from "../service/nibssprovider.js";
import bcrypt from "bcrypt";
import { decryptData, encryptData } from "../utils/encryption.js";
import { validateTransfer, validateOnboarding } from "../utils/validation.js";
import { transferEmailTemplate } from "../html/transfertemplate.js";
import mongoose from "mongoose";
export const createUser = async (req, res) => {
  try {
    const { error } = validateOnboarding(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
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
    if (!nibssData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification info" });
    }
    console.log(nibssData);
    if (
      firstName.toLowerCase() !== nibssData.response.firstName.toLowerCase() ||
      lastName.toLowerCase() !== nibssData.response.lastName.toLowerCase() ||
      new Date(dob).toISOString().split("T")[0] !==
        nibssData.response.dob.split("T")[0]
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Credentials don't match" });
    }
    const token = await getNibssToken();
    const nibssResponse = await nibssClient.post(
      "/account/create",
      {
        kycType: verificationMethod.toLowerCase(),
        kycID: verificationId,
        dob: dob,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const nibssAccount = nibssResponse.data.account;
    console.log(nibssAccount);
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);
    const hashedPasscode = await bcrypt.hash(passcode, salt);
    const encryptedVerificationId = await encryptData(verificationId);
    const newUser = await userModels.create({
      firstName,
      lastName,
      email,
      phone,
      dob,
      passcode: hashedPasscode,
      pin: hashedPin,
      isVerified: true,
      verificationMethod,
      verificationId: encryptedVerificationId,
      accountNumber: nibssAccount.accountNumber,
      accountBalance: nibssAccount.balance,
    });
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      account: {
        accountNumber: newUser.accountNumber,
        accountName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        phone: newUser.phone,
        balance: newUser.accountBalance,
        joinedAt: newUser.createdAt,
      },
    });
    sendWelcomeEmail(newUser.email, newUser.firstName);
  } catch (error) {
    const realErrorMessage = error.response?.data.message;
    if (realErrorMessage === "nin already linked to an account") {
      console.log(realErrorMessage);
      return res.status(409).json({
        success: false,
        message:
          " This nin is already registered to a Bank Account, Please login to your account",
      });
    }
    console.log(
      `critical error in create user:`,
      realErrorMessage,
      error.message,
    );
    res.status(400).json({
      success: false,
      message: "Verification Failed please try again later",
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, passcode } = req.body;
    const user = await userModels.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Passcode or Email is Incorrect" });
    }
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil(
        (user.lockUntil - Date.now()) / 1000 / 60,
      );
      console.log(`${user._id} Account  is on lock until ${remainingTime}`);
      return res.status(403).json({
        success: false,
        message: "Your account is locked please try again later",
      });
    }
    const isPasscodeValid = await bcrypt.compare(passcode, user.passcode);
    if (!isPasscodeValid) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
        await user.save();
        return res.status(403).json({
          success: false,
          message: "Too many failed attempts try again later",
        });
      }
      await user.save();
      return res
        .status(401)
        .json({ success: false, message: "Passcode or Email is Incorrect" });
    }
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    const token = jwt.sign(
      { accountNumber: user.accountNumber },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res
      .status(200)
      .json({ success: true, message: "login successful", token: token });
    console.log({ success: true, message: "login successful", token: token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Please try again later" });
    console.log(error.message);
  }
};
export const nameEnquiry = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    if (accountNumber.length !== 10 || typeof accountNumber !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Account Number" });
    }
    const localUser = await userModels.findOne({ accountNumber });
    if (localUser) {
      return res.status(200).json({
        success: true,
        accountName: `${localUser.firstName} ${localUser.lastName}`,
        bankName: "IZI Bank",
        type: "internal",
      });
    }
    const token = await getNibssToken();
    const externalUser = await nibssClient.get(
      `/account/name-enquiry/${accountNumber}`,
      {
        headers: {
          Authorization: ` Bearer ${token}`,
        },
      },
    );
    res.status(200).json({
      success: true,
      accountName: externalUser.data.accountName,
      bankName: externalUser.data.bankName,
      type: "external",
    });
    console.log({ success: true, data: externalUser.data });
  } catch (error) {
    res.status(404).json({ success: false, message: "Account not found" });
    console.log(error.message);
  }
};
export const initiateTransfer = async (req, res) => {
  //  const session = await mongoose.startSession();
  //session.startTransaction();
  try {
    const { to, amount, pin, narration } = req.body;
    if (to.length !== 10 || pin.length !== 4 || typeof narration !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
    const from = req.user.accountNumber;
    const { error } = validateTransfer({ to, amount, pin, narration });
    if (error) throw new Error(error.details[0].message);
    const sender = await userModels
      .findOne({
        accountNumber: from,
      })
      .session(session);
    if (!sender) {
      return res
        .status(404)
        .json({ success: false, message: "sender not found" });
    }
    const isPinValid = await bcrypt.compare(pin, sender.pin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Invalid Pin" });
    }
    if (sender.accountBalance < amount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient Funds" });
    }

    const token = await getNibssToken();
    const recipient = await nibssClient.get(`/account/name-enquiry/${to}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient Not Found" });
    }
    console.log("checking if recipient account is real:", recipient);
    const nibssResponse = await nibssClient.post(
      "/transfer",
      {
        from,
        to,
        amount,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const refId = nibssResponse.data.reference;
    sender.accountBalance -= Number(amount);
    await sender.save({ session });
    const localRecipient = await userModels
      .findOne({ accountNumber: to })
      .session(session);
    if (localRecipient) {
      localRecipient.accountBalance += Number(amount);
      await localRecipient.save();
      //  await localRecipient.save({ session });
    }
    await transactionmodels.create(
      [
        {
          senderAccountNumber: from,
          recipientAccountNumber: to,
          amount,
          referenceId: refId,
          type: localRecipient ? "Intra-Bank" : "Inter-Bank",
          narration,
        },
      ],
      //{ session },
    );
    // await session.commitTransaction();
    //session.endSession();
    res.status(200).json({
      success: true,
      message: "Transaction Successful",
      balance: sender.accountBalance,
      narration,
      reference: refId,
    });
    await transferEmailTemplate(sender.email, {
      firstName: sender.firstName,
      amount: amount,
      recipientName: recipient.data.accountName,
      recipientBank: recipient.data.bankName,
      refId: refId,
      balance: sender.accountBalance,
      narration: narration,
    });
    console.log({
      success: true,
      message: "Transaction Successful",
      reference: refId,
    });
  } catch (error) {
    await session.abortTransaction();
    // session.endSession();
    console.log("Transaction Error", error.response?.data || error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
export const getTransactionStatus = async (req, res) => {
  try {
    const { ref } = req.body;
    const token = await getNibssToken();
    const response = await nibssClient.get(`/transaction/${ref}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: "Transaction record not found" });
    console.log(error.message);
  }
};
export const getAccountBallance = async (req, res) => {
  try {
    const { accountNumber } = req.user;
    const user = await userModels.findOne({ accountNumber });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account Not Found" });
    }
    res.status(200).json({
      success: true,
      accountNumber: user.accountNumber,
      balance: user.accountBalance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "try again later" });
    console.log(error.message);
  }
};
export const getMyTransactionHistory = async (req, res) => {
  try {
    const { accountNumber } = req.user;
    const history = await transactionmodels
      .find({
        $or: [
          { senderAccountNumber: accountNumber },
          { recipientAccountNumber: accountNumber },
        ],
      })
      .sort({ createdAt: -1 });
    if (history.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No Transaction Found " });
    }
    res
      .status(200)
      .json({ success: true, count: history.length, transactions: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Try again later" });
    console.log(error.message);
  }
};
export const getMyIdentity = async (req, res) => {
  try {
    const { accountNumber } = req.user;
    const user = await userModels.findOne({ accountNumber });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    const decryptedId = await decryptData(user.verificationId);
    res.status(200).json({
      success: true,
      verificationMethod: user.verificationMethod,
      verificationId: decryptedId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "please try again later" });
    console.log(error.message);
  }
};
