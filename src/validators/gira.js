const Joi = require("joi");

module.exports = {
  get: Joi.object({
    name: Joi.string(),
    startAt: Joi.date(),
  }),
  post: Joi.object({
    name: Joi.string().required(),
    createdAt: Joi.date(),
    startAt: Joi.date().required(),
    registrationStartAt: Joi.date().required(),
    publicLimit: Joi.number(),
  }),
};
