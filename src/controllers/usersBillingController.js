const express = require("express");
const handle = require("express-async-handler");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

const BillingValueGroups = require("../models/BillingValueGroups");
const Users = require("../models/Users");
const UsersBilling = require("../models/UsersBilling");

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
      const usersBilling = await UsersBilling.find();

      return res.status(200).json({ data: usersBilling });
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
      const { user_id, billing_value_group } = req.body;
      if (!user_id || !billing_value_group) {
        return res.status(400).json({
          message: "Não é possível associar o usuário ao grupo de pagamento.",
        });
      }

      const billingGroupExists = await BillingValueGroups.findById(
        billing_value_group
      );
      console.log(billingGroupExists);
      if (!billingGroupExists) {
        return res.status(400).json({
          message: "O grupo de pagamento fornecido não existe",
        });
      }

      const userExists = await Users.findOne({ user_id });
      if (!userExists) {
        return res.status(400).json({
          message: "O usuário não existe",
        });
      }

      await UsersBilling.findOneAndDelete({
        user_id,
      });

      const userBilling = await UsersBilling.create({
        user_id,
        billing_value_group,
      });

      return res.status(201).json({ data: userBilling });
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
  "/inactivate/:user_id",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny", "/user-billing/inactivate")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({
          message: "Um usuário precisa ser fornecido.",
        });
      }

      const userExists = await Users.findOne({ user_id });
      if (!userExists) {
        return res.status(400).json({
          message: "O usuário não existe",
        });
      }

      await UsersBilling.findOneAndUpdate(
        {
          user_id,
        },
        {
          active: false,
          billing_value_group: null,
        }
      );

      return res.status(200).send();
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
  "/",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({
          message: "Usuário inválido.",
        });
      }

      const userExists = await Users.findOne({ user_id });
      if (!userExists) {
        return res.status(400).json({
          message: "O usuário não existe",
        });
      }

      await UsersBilling.findOneAndDelete({
        user_id,
      });

      return res.status(200);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

module.exports = (app) => app.use("/user-billing", router);
