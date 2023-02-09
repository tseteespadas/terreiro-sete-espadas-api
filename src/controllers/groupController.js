const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});
const { v4: uuid } = require("uuid");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

const Groups = require("../models/Groups");
const UserGroups = require("../models/UserGroups");
const CalendarEvent = require("../models/CalendarEvent");

const afterResponse = require("../helpers/afterResponse");
const Users = require("../models/Users");

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
      const { user_id, group_id } = req.body;
      console.log(req);
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
            groups: event.groups.filter((id) => id !== group_id)
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
