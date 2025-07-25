const Joi = require("joi");

module.exports = {
  paramId: Joi.object({
    id: Joi.string().required(),
  }),
  queryPaginated: Joi.object({
    page: Joi.number().min(1).required(),
    limit: Joi.number().min(1).max(100).default(10),
  }),
  queryDate: Joi.object({
    date: Joi.date().required(),
  }),
  postGira: Joi.object({
    name: Joi.string().required(),
    date: Joi.date().required(),
  }),
  post: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    pronoums: Joi.string().required(),
    preferred: Joi.boolean().required(),
  }),
};
