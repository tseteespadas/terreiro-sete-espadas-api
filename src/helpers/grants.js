const { AccessControl } = require("accesscontrol");

const ac = new AccessControl();

ac.grant("user")
  .readOwn("/calendar/events")
  .readOwn("/group")
  .readAny("/playlists");

ac.grant("admin")
  .extend("user")
  .readAny("/v2/user/list")
  .createAny("/v2/user/create")
  .updateAny("/v2/user/update")
  .deleteAny("/v2/user/delete")
  .readAny("/groups")
  .readAny("/groups/users")
  .createAny("/groups")
  .updateAny("/groups")
  .updateAny("/groups/user")
  .deleteAny("/groups")
  .readAny("/calendar/events")
  .createAny("/calendar/event")
  .deleteAny("/calendar/event")
  .updateAny("/calendar/event")
  .readAny("/billing-user-groups")
  .createAny("/billing-user-groups")
  .deleteAny("/billing-user-groups")
  .updateAny("/billing-user-groups")
  .updateAny("/billing-user-groups/change-user-group")
  .updateAny("/billing-user-groups/users")
  .updateAny("/billing-user-groups/activate")
  .updateAny("/billing-user-groups/inactivate")
  .readAny("/billing-value-groups")
  .createAny("/billing-value-groups")
  .updateAny("/billing-value-groups")
  .deleteAny("/billing-value-groups")
  .deleteAny("/giras");

ac.lock();

module.exports = ac;
