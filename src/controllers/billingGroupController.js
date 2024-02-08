const express = require("express");
const handle = require("express-async-handler");
const { v4: uuid } = require("uuid");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

const BillingValueGroups = require("../models/BillingValueGroups");
const BillingUsers = require("../models/BillingUsers");

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
      const billingValueGroups = await BillingValueGroups.find();

      return res.status(200).json(billingValueGroups);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

router.get(
  "/:id",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "readAny", "/billing-value-groups")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { id } = req.params;
      const billingValueGroup = await BillingValueGroups.findOne({ id }).select(
        {
          id: 1,
          name: 1,
          value: 1,
        }
      );
      if (!billingValueGroup) {
        return res
          .status(400)
          .json({ message: "O grupo solicitado não existe." });
      }

      const billingGroupUsers = await BillingUsers.find({
        billing_group_id: id,
      }).select({
        id: 1,
        user_name: 1,
        user_billing_email: 1,
        user_email: 1,
        billing_group_id: 1,
        active: 1,
      });

      return res
        .status(200)
        .json({ group: billingValueGroup, users: billingGroupUsers });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
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
      const { value, name } = req.body;
      if (!value || !name || value <= 0) {
        return res.status(400).json({
          message:
            "Não é possível criar um grupo de pagamento com os dados fornecidos.",
        });
      }
      const exists = await BillingValueGroups.findOne({
        name: name.toLowerCase(),
      });

      if (exists) {
        return res
          .status(400)
          .json({ message: "Um grupo de cobrança com esse nome já existe." });
      }

      const billingGroup = await BillingValueGroups.create({
        id: uuid(),
        value,
        name: name.toLowerCase(),
      });

      return res.status(201).json(billingGroup);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
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
      const { value, name, id } = req.body;
      if (!value || !name || !id || value <= 0) {
        return res.status(400).json({
          message:
            "Não é possível atualizar o grupo de pagamento com os dados fornecidos.",
        });
      }
      const exists = await BillingValueGroups.findOne({
        id,
      });

      if (!exists) {
        return res
          .status(400)
          .json({ message: "O grupo de cobrança com esse id não existe." });
      }

      const billingGroup = await BillingValueGroups.findOneAndUpdate(
        { id },
        {
          value,
          name: name.toLowerCase(),
        }
      );

      return res.status(200).json(billingGroup);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

router.delete(
  "/:id",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny", "/billing-value-groups")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          message:
            "Não é possível excluir o grupo de pagamento com os dados fornecidos.",
        });
      }
      const exists = await BillingValueGroups.findOne({
        id,
      });

      if (!exists) {
        return res
          .status(400)
          .json({ message: "O grupo de cobrança com esse id não existe." });
      }

      await BillingValueGroups.deleteOne({ id });

      return res.status(200).json();
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

module.exports = (app) => app.use("/billing-value-groups", router);
