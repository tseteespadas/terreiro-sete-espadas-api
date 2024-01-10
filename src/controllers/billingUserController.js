const express = require("express");
const handle = require("express-async-handler");
const { v4: uuid } = require("uuid");
const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

const BillingUsers = require("../models/BillingUsers");
const BillingValueGroups = require("../models/BillingValueGroups");

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
      const billingUsers = await BillingUsers.find();

      return res.status(200).json({ data: billingUsers });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

/** Get billing info of one user */
router.get(
  "/:user_id/billing",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (
        !permissionMiddleware(req, "readAny", "/v2/user/list") ||
        !permissionMiddleware(req, "readAny", "/billing-user-groups")
      ) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      const { user_id } = req.params;

      const user = await Users.findOne({ user_id }).select({
        _id: 1,
        user_id: 1,
        email: 1,
      });

      if (!user) {
        return res.status(400).json({
          message: "O usuário não existe.",
        });
      }

      const userBillingInfo = await BillingUsers.findOne({
        user_email: user.email,
      }).select({
        id: 1,
        user_name: 1,
        user_billing_email: 1,
        user_email: 1,
        billing_group_id: 1,
        active: 1,
      });

      const billingValueGroup = await BillingValueGroups.find({
        id: userBillingInfo.billing_group_id,
      });

      return res.status(200).json({
        ...userBillingInfo,
        billingGroup: billingValueGroup,
      });
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
      const { user_name, user_email, user_billing_email, billing_group_id } =
        req.body;
      if (
        !user_name ||
        !user_email ||
        !user_billing_email ||
        !billing_group_id
      ) {
        return res.status(400).json({
          message:
            "Não é possível associar o usuário a um grupo de pagamentos.",
        });
      }
      const associationExists = await BillingUsers.findOne({
        user_email,
        user_billing_email,
      });

      if (associationExists) {
        return res.status(400).json({
          message: "O usuário já está associado a um grupo de pagamento.",
        });
      }

      const billingValueGroupExists = await BillingValueGroups.findOne({
        id: billing_group_id,
      });

      if (!billingValueGroupExists) {
        return res
          .status(400)
          .json({ message: "O grupo de pagamento não existe." });
      }

      const billingUser = await BillingUsers.create({
        id: uuid(),
        user_name,
        user_email,
        user_billing_email,
        billing_group_id,
      });

      return res.status(201).json({ data: billingUser });
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
      const { id, user_email, user_billing_email, billing_group_id } = req.body;
      if (!id || !user_email || !user_billing_email || !billing_group_id) {
        return res.status(400).json({
          message:
            "Não é possível atualizar o usuário e seu grupo de pagamento com os dados fornecidos.",
        });
      }
      const billingGroupExists = await BillingValueGroups.findOne({
        id: billing_group_id,
      });
      const userAssociationExists = await BillingUsers.findOne({
        id,
      });

      if (!billingGroupExists || !userAssociationExists) {
        return res
          .status(400)
          .json({ message: "O grupo e/ou o usuário não existem." });
      }

      const userBilling = await BillingUsers.findOneAndUpdate(
        { id },
        {
          user_email,
          user_billing_email,
          billing_group_id,
        }
      );

      return res.status(200).json({ data: userBilling });
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
  "/change-user-group",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { user_email, billing_group_id } = req.body;
      if (!user_email || !billing_group_id) {
        return res.status(400).json({
          message:
            "Não é possível atualizar o usuário e seu grupo de pagamento com os dados fornecidos.",
        });
      }
      const billingGroupExists = await BillingValueGroups.findOne({
        id: billing_group_id,
      });
      const userAssociationExists = await BillingUsers.findOne({
        user_email,
      }).select({ user_email: 1 });

      if (!billingGroupExists || !userAssociationExists) {
        return res
          .status(400)
          .json({ message: "O grupo e/ou o usuário não existem." });
      }

      const userBilling = await BillingUsers.findOneAndUpdate(
        { user_email },
        {
          billing_group_id,
        }
      );

      return res.status(200).json({ data: userBilling });
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
  "/activate",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({
          message:
            "Não é possível ativar o envio de cobranças para o usuário com os dados fornecidos.",
        });
      }

      const userAssociationExists = await BillingUsers.findOne({
        id,
      });

      if (!userAssociationExists) {
        return res.status(400).json({ message: "O usuário não existe." });
      }

      const userBilling = await BillingUsers.findOneAndUpdate(
        { id },
        {
          active: true,
        }
      );

      return res.status(200).json({ data: userBilling });
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
  "/inactivate",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({
          message:
            "Não é possível inativar o envio de cobranças para o usuário com os dados fornecidos.",
        });
      }

      const userAssociationExists = await BillingUsers.findOne({
        id,
      });

      if (!userAssociationExists) {
        return res.status(400).json({ message: "O usuário não existe." });
      }

      const userBilling = await BillingUsers.findOneAndUpdate(
        { id },
        {
          active: false,
        }
      );

      return res.status(200).json({ data: userBilling });
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
  "/:id",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny", "/billing-user-groups")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          message:
            "Não é possível excluir o usuário do grupo de pagamento com os dados fornecidos.",
        });
      }
      const exists = await BillingUsers.findOne({
        id,
      });

      if (!exists) {
        return res
          .status(400)
          .json({ message: "O usuário com esse id não existe." });
      }

      await BillingUsers.deleteOne({ id });

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

module.exports = (app) => app.use("/billing-user-groups", router);
