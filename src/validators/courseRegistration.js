const Joi = require("joi");

module.exports = {
  courseId: Joi.object({
    courseId: Joi.string().required()
  }),
  get: Joi.object({
    name: Joi.string(),
    startAt: Joi.date(),
  }),
  post: Joi.object({
    courseId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    gender: Joi.string().required(),
    address: Joi.string().required(),
  }),
};
