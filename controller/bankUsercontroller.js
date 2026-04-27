import userModels from "../models/bankusermodels.js";
import transactionmodels from "../models/transactionmodels.js";
import nibssClient, {
  verifyUserIdentity,
  getNibssToken,
} from "../service/nibssprovider.js";
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
      dob,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !verificationMethod ||
      !verificationId ||
      !passcode ||
      pin.length !== 4 ||
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
    if (!nibssData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification info" });
    }
    console.log(nibssData);
    if (
      firstName.toLowerCase() !== nibssData.response.firstName.toLowerCase() ||
      lastName.toLowerCase() !== nibssData.response.lastName.toLowerCase() ||
      dob !== nibssData.response.dob
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
      verificationId,
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
  } catch (error) {
    const realErrorMessage = error.response?.data || error.message;
    console.log("critical error in create user: ", realErrorMessage);
    res.status(400).json({ success: false, Error_located: realErrorMessage });
  }
};
export const nameEnquiry = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    if (accountNumber.length !== 11 || typeof accountNumber !== "String") {
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
          Authorization: `  Bearer ${token}`,
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
  try {
    const { from, to, amount, pin, narration } = req.body;
    if (
      from.length !== 11 ||
      to.length !== 11 ||
      pin.length !== 4 ||
      typeof narration !== "string"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
    const sender = await userModels.findOne({
      accountNumber: from,
    });
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
      return res.status
        .status(400)
        .json({ success: false, meesage: "Insufficient Funds" });
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
    const nibssResponse = await nibssClient.post(
      "/tranfer",
      {
        from,
        to,
        amount,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const refId = nibssResponse.data.refereence;
    sender.accountBalance -= Number(amount);
    await sender.save();
    const localRecipient = await userModels.findOne({ accountNumber: to });
    if (localRecipient) {
      localRecipient.accountBalance += Number(amount);
      await localRecipient.save();
    }
    await transactionmodels.create({
      senderAccountNumber: from,
      recipientAccountNumber: to,
      amount,
      ReferenceId: refId,
      type: localRecipient ? "Intra-Bank" : "Inter-Bank",
      narration,
    });
    res.status(200).json({
      success: true,
      message: "Transaction Successful",
      refereence: refId,
    });
    console.log({
      success: true,
      message: "Transaction Successful",
      refereence: refId,
    });
  } catch (error) {
    console.log("Transaction Error", error.response?.data || error.message);
    res.status(400).json({ success: false, message: "transaction failed" });
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
    const { accountNumber } = req.body;
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
    const { accountNumber } = req.body;
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
