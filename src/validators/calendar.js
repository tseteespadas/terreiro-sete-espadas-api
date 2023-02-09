const Joi = require("joi");

module.exports = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
  })
};
