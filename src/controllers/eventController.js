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

router.get(
  "/events",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (
        !permissionMiddleware(req, "readOwn") ||
        !permissionMiddleware(req, "readAny")
      ) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { year, month } = req.query;
      if (req.user.role === "admin") {
        const events = await CalendarEvent.find({ year, month });

        return res.status(200).json(events);
      } else {
        const events = await CalendarEvent.find({
          year,
          month,
          groups: { $in: req.user.groups },
        });
        return res.status(200).json(events);
      }
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
  "/event",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "createAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      await CalendarEvent.create({
        event_id: uuid(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return res.status(201).json({ message: "Evento criado com sucesso." });
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
  "/event/:id",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny", "/calendar/event")) {
        console.log("entering here")
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { id } = req.params;
      const found = await CalendarEvent.find({ event_id: id });
      if (!found) {
        return res.status(400).json({ message: "O evento não existe." });
      }
      await CalendarEvent.deleteOne({ event_id: id });
      return res.status(200).json({ message: "Evento removido com sucesso." });
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
  "/event",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { event_id, groups } = req.body;
      const eventExists = await CalendarEvent.findOne({
        event_id,
      });
      if (!eventExists) {
        return res.status(400).json({ message: "O evento não existe." });
      }

      for (const group of groups) {
        const groupExists = await Groups.findOne({ group_id: group });
        if (!groupExists) {
          return res
            .status(400)
            .json({ message: "O grupo " + group + " não existe." });
        }
      }

      await CalendarEvent.findOneAndUpdate({ event_id }, req.body);

      return res
        .status(200)
        .json({ message: "Evento atualizado com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

module.exports = (app) => app.use("/calendar", router);
