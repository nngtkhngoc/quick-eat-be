import Joi from "@hapi/joi";

export const signUpValidator = Joi.object({
  username: Joi.string().alphanum().min(6).max(20).required().messages({
    "any.required": "Username is required",
    "string.empty": "Username must not be empty",
    "string.min": "Username must be at least 6 characters",
    "string.max": "Username must not be over 20 characters",
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .pattern(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    )
    .required()
    .messages({
      "string.empty": "Email must not be empty",
      "string.email": "Email is unvalid",
      "any.required": "Email is required",
      "string.pattern.base": "Email is unvalid",
    }),
  phone_number: Joi.string()
    .pattern(/^[0-9\s]+$/)
    .min(8)
    .max(12)
    .allow("")
    .messages({
      "any.required": "Phone number is required",
      "string.empty": "Phone number must not be empty",
      "string.pattern.base": "Phone number is unvalid",
      "string.min": "Phone number must be at least 8 characters",
      "string.max": "Phone number must not be over 12 characters",
    }),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .min(6)
    .max(20)
    .messages({
      "any.required": "Password is required",
      "string.empty": "Password must not be empty",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must not be over 20 characters",
      "string.pattern.base": "Password is unvalid",
    }),
  confirm_password: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "any.required": "Confirm password is required",
      "any.only": "Password is not match",
    }),
  role: Joi.string(),
  profile_pic: Joi.string(),
  fullname: Joi.string(),
});
