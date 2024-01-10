const Joi = require("joi");

module.exports = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    userGroups: Joi.array().items(Joi.string()).required(),
    paymentGroup: Joi.string().required(),
  }),
  confirm: Joi.object({
    user_id: Joi.string().required(),
    password: Joi.string()
      .regex(
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])((?=.*[-+_!@#$%^&*.,?])|(?=.*_))^[^ ]+$/
      )
      .required(),
  }),
  delete: Joi.object({
    user_id: Joi.string().required(),
  }),
  update: Joi.object({
    user_id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
