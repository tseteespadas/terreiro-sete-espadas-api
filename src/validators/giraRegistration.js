const Joi = require("joi");

module.exports = {
  giraId: Joi.object({
    giraId: Joi.string().required()
  }),
  get: Joi.object({
    name: Joi.string(),
    startAt: Joi.date(),
  }),
  post: Joi.object({
    giraId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  }),
};
