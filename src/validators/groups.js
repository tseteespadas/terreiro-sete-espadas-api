const Joi = require("joi");

module.exports = {
  users: Joi.object({
    group_id: Joi.string().required(),
  }),
};
