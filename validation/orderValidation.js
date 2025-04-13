import Joi from "@hapi/joi";

export const createOrderValidation = Joi.object({
  fullname: Joi.string().min(2).max(50).required().messages({
    "any.required": "Fullname is required",
    "string.empty": "Fullname must not be empty",
    "string.min": "Fullname must be at least 2 characters",
    "string.max": "Fullname must not be over 20 characters",
  }),

  phone_number: Joi.string()
    .pattern(/^[0-9\s]+$/)
    .min(10)
    .max(12)
    .allow("")
    .messages({
      "any.required": "Phone number is required",
      "string.empty": "Phone number must not be empty",
      "string.pattern.base": "Phone number is unvalid",
      "string.min": "Phone number must be at least 10 characters",
      "string.max": "Phone number must not be over 12 characters",
    }),

  payment: Joi.string(),
  address: Joi.string(),
});
