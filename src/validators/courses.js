const Joi = require("joi");

module.exports = {
  courseId: Joi.object({
    courseId: Joi.string().required()
  }),
  post: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
  }),
};
