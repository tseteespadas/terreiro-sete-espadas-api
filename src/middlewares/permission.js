const ac = require("../helpers/grants");

function permissionMiddleware(req, privilege, resource = null) {
  const r = resource || req.originalUrl.split("?")[0];
  return ac.can(req.user.role)[privilege](r).granted;
}

module.exports = permissionMiddleware;