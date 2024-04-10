const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)
    .messages({
      "string.min": "Name must contain at least 3 letters",
      "string.max": "Name can contain no more than 30 letters",
      "string.pattern.base": "The name can consist of letters and spaces",
    }),
  email: Joi.string().email().messages({
    "string.email": "Invalid email format",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{3}-[0-9]{3}-[0-9]{3}$/)
    .messages({
      "string.pattern.base": "Invalid format. Example XXX-XXX-XXX",
    }),
  favortie: Joi.boolean().messages({
    "boolean.base": "Favorite must be true or false value",
  }),
});

module.exports = schema;
