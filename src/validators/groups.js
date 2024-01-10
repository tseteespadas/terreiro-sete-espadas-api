const Joi = require("joi");

module.exports = {
  users: Joi.object({
    group_id: Joi.string().required(),
  }),
  updateUserGroupsBody: Joi.object({
    groups: Joi.array().items(Joi.string()).required(),
  }),
  updateUserGroupsParam: Joi.object({
    user_id: Joi.string().required(),
  }),
};
