const Users = require("../models/Users");
const UserGroups = require("../models/UserGroups");

async function groupsMiddleware(req, res, next) {
  if (req.user) {
    try {
      const userRole = await Users.findOne({ user_id: req.user.user_id }).select("role");
      const groups = await UserGroups.find({ user_id: req.user.user_id }).select("group_id");
      req.user.role = userRole.role;
      req.user.groups = groups.map(({group_id}) => group_id);
      console.log(req.user);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "O servidor não foi capaz de processar sua solicitação. Entre em contato com um administrador." });
    }
  }
  return next();
}

module.exports = groupsMiddleware;
