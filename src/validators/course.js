const Joi = require("joi");

module.exports = {
  get: Joi.object({
    name: Joi.string(),
    startAt: Joi.date(),
  }),
  post: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    createdAt: Joi.date(),
    startAt: Joi.date().required(),
    subscriptionDateLimit: Joi.date().required(),
    registrationFee: Joi.number().required(),
    monthlyFee: Joi.number().required(),
  }),
};