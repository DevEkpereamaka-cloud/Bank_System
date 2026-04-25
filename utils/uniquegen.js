import user from "../models/bankusermodels.js";
export const generateUniqueAccountNumber = async () => {
  let isUnique = false;
  let accountNumber;
  while (!isUnique) {
    accountNumber = Math.floor(
      1000000000 + Math.random() * 9000000000,
    ).toString();
    const existingAccount = await user.findOne({ accountNumber });
    if (!existingAccount) {
      isUnique = true;
    }
  }
  return accountNumber;
};
