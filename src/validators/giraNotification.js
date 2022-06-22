const Joi = require("joi");

module.exports = {
  subscriptionId: Joi.object({
    id: Joi.string().required()
  }),
  post: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  }),
};
