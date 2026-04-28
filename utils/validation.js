import joi from "joi";
const phoneRegex = /^[0-9]{11}$/;
const pinRegex = /^[0-9]{4}&/;
export const validateOnboarding = (data) => {
  const schema = joi
    .object({
      firstName: joi.string().trim().min(2).required(),
      lastName: joi.string().trim().min(2).required(),
      email: joi.string().email().lowercase().required(),
      phone: joi.string().pattern(phoneRegex).required(),
      dob: joi.date().less("now").required(),
      passcode: joi.string().min(6).required(),
      pin: joi.string().pattern(pinRegex).required(),
      verificationMethod: joi.string().valid("nin", "bvn").required(),
      verificationId: joi.string().trim().alphanum().required(),
    })
    .unknown(false);
  return schema.validate(data, { abortEarly: false });
};
export const validateTransfer = (data) => {
  const schema = joi
    .object({
      to: joi
        .string()
        .pattern(/^[0-9]{10}$/)
        .required(),
      amount: joi.number().integer().positive().min(1000).required(),
      pin: joi.string().pattern(pinRegex).required(),
      narration: joi.string().trim().max(50).allow(""),
    })
    .unknown(false);
  return schema.validate(data);
};
