const { AccessControl } = require("accesscontrol");

const ac = new AccessControl();

ac.grant("user")
  .readOwn("/calendar/events")
  .readOwn("/group");

ac.grant("admin")
  .extend("user")
  .readAny("/user/list")
  .createAny("/user/create")
  .updateAny("/user")
  .deleteAny("/user")
  .readAny("/groups")
  .readAny("/groups/users")
  .createAny("/groups")
  .updateAny("/groups")
  .deleteAny("/groups")
  .readAny("/calendar/events")
  .createAny("/calendar/event")
  .deleteAny("/calendar/event")
  .updateAny("/calendar/event");

ac.lock();

module.exports = ac;
