const Joi = require("joi");

module.exports = {
  courseId: Joi.object({
    courseId: Joi.string().required()
  }),
  post: Joi.object({
    course_id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    gender: Joi.string().required(),
    pronoums: Joi.string().required(),
    address: Joi.string().required(),
    cep: Joi.string().required(),
    number: Joi.string().required(),
    city: Joi.string().required(),
    neighborhood: Joi.string().required(),
  }),
};
