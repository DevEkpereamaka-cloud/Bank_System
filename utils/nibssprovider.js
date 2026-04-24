import axios from "axios";
export const verifyUserIdentity = async (type, number) => {
  try {
    const endpoint =
      type.toUpperCase() === "BVN" ? "validateBvn" : "validateNin";
    const response = await axios.post(
      `${process.env.NIBSS_BASE_URL}${endpoint}`,
      { number: number },
      {
        header: {
          "client-id": process.env.NIBSS_BANK_CODE,
          "client-secret": process.env.NIBSS_API_SECRET,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Verification Failed");
  }
};
