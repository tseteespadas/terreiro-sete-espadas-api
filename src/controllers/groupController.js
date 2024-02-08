const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});
const { v4: uuid } = require("uuid");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

const GroupValidator = require("../validators/groups");

const Users = require("../models/Users");
const Groups = require("../models/Groups");
const UserGroups = require("../models/UserGroups");
const CalendarEvent = require("../models/CalendarEvent");

const afterResponse = require("../helpers/afterResponse");

router.get(
  "/",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "readAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const groups = await Groups.find();

      return res.status(200).json({ groups });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

// get group and users info given an group_id
router.get(
  "/:group_id/data",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "readAny", "/groups")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { group_id } = req.params;
      const group = await Groups.findOne({ group_id }).select({
        group_name: 1,
      });
      const usersIds = await UserGroups.find({ group_id }).select({
        user_id: 1,
      });
      const users = await Users.find({
        user_id: usersIds.map((u) => u.user_id),
      }).select({
        user_id: 1,
        name: 1,
        email: 1,
        role: 1,
        avatarUrl: 1,
      });

      return res.status(200).json({
        group: {
          group_id,
          group_name: group.group_name,
        },
        users,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

router.get(
  "/users",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "readAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { group_id } = req.query;
      const usersIds = await UserGroups.find({ group_id }).select({
        user_id: 1,
      });

      const users = await Users.find({
        user_id: usersIds.map((u) => u.user_id),
      }).select({
        user_id: 1,
        name: 1,
        email: 1,
        role: 1,
        avatarUrl: 1,
      });

      return res.status(200).json({ users });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

/** Get groups info of one user */
router.get(
  "/:user_id/groups",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (
        !permissionMiddleware(req, "readAny", "/v2/user/list") ||
        !permissionMiddleware(req, "readAny", "/groups/users")
      ) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      const { user_id } = req.params;

      const user = await Users.findOne({ user_id }).select({
        _id: 1,
        user_id: 1,
      });

      if (!user) {
        return res.status(400).json({
          message: "O usuário não existe.",
        });
      }

      const userGroups = await UserGroups.find({ user_id });

      const groups = await Groups.find({
        group_id: userGroups.map((userGroup) => userGroup.group_id),
      });

      return res.status(200).json(groups);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

/** Update user groups */
router.put(
  "/:user_id",
  authMiddleware,
  groupsMiddleware,
  validator.params(GroupValidator.updateUserGroupsParam),
  validator.body(GroupValidator.updateUserGroupsBody),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny", "/groups/user")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { user_id } = req.params;
      const { groups } = req.body;

      const exists = await Users.findOne({ user_id });
      if (!exists) {
        return res.status(400).json({ message: "O usuário não existe." });
      }

      for (const groupId of groups) {
        const exists = await Groups.findOne({ group_id: groupId });
        if (!exists) {
          return res.status(400).json({ message: "O grupo não existe." });
        }
      }

      const newGroups = groups.map((group_id) => ({
        user_id,
        group_id,
      }));
      await UserGroups.deleteMany({ user_id });
      await UserGroups.insertMany(newGroups);

      return res
        .status(200)
        .json({ message: "Os usuários foram atualizados com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

router.post(
  "/",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "createAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { group_name } = req.body;

      const exists = await Groups.findOne({ group_name });
      if (exists) {
        return res.status(400).json({ message: "O grupo já existe." });
      }

      Groups.create({
        group_id: uuid(),
        group_name,
      });

      return res.status(201).json({ message: "Grupo foi criado com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

router.put(
  "/",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { group_id } = req.body;

      const exists = await Groups.findOne({ group_id });
      if (!exists) {
        return res.status(400).json({ message: "O grupo não existe." });
      }

      await Groups.findOneAndUpdate({ group_id }, req.body);

      return res
        .status(200)
        .json({ message: "Os usuários foram atualizados com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

router.patch(
  "/",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const group_id = req.body.group_id;
      const users = [];
      if (
        req.body.users &&
        typeof req.body.users === "object" &&
        req.body.users.hasOwnProperty("length")
      ) {
        req.body.users.forEach((user) => {
          if (user && typeof user === "string") {
            users.push(user);
          }
        });
      } else if (req.body.user_id && typeof req.body.user_id === "string") {
        users.push(req.body.user_id);
      } else {
        return res
          .status(400)
          .json({ message: "Os dados fornecidos são inválidos." });
      }
      const exists = await Groups.findOne({ group_id });
      if (!exists) {
        return res.status(400).json({ message: "O grupo não existe." });
      }
      const currentUsersInGroup = await UserGroups.find({ group_id }).select({
        user_id: 1,
      });

      const currentUsersIdsInGroup = currentUsersInGroup.map(
        ({ user_id }) => user_id
      );

      for (const user_id of users) {
        if (currentUsersIdsInGroup.includes(user_id)) {
          await UserGroups.deleteOne({
            group_id,
            user_id,
          });
        } else {
          await UserGroups.create({
            group_id,
            user_id,
          });
        }
      }

      return res
        .status(200)
        .json({ message: "O usuário foi atualizado com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

router.delete(
  "/:group_id",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny", "/groups")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { group_id } = req.params;

      const exists = await Groups.findOne({ group_id });
      if (!exists) {
        return res.status(400).json({ message: "O grupo não existe." });
      }

      await Groups.deleteOne({ group_id });
      await UserGroups.deleteMany({
        group_id,
      });

      const events = await CalendarEvent.find({
        groups: {
          $in: group_id,
        },
      }).select({ event_id: 1, groups: 1 });

      for (const event of events) {
        await CalendarEvent.updateOne(
          {
            event_id: event.event_id,
          },
          {
            groups: event.groups.filter((id) => id !== group_id),
          }
        );
      }

      return res
        .status(200)
        .json({ message: "O grupo foi removido com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

module.exports = (app) => app.use("/groups", router);
