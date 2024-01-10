const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});
const { v4: uuid } = require("uuid");

const router = express.Router();

const authMiddleware = require("../../middlewares/auth");
const groupsMiddleware = require("../../middlewares/groups");
const permissionMiddleware = require("../../middlewares/permission");

const Users = require("../../models/Users");
const Groups = require("../../models/Groups");
const UserGroups = require("../../models/UserGroups");
const BillingUsers = require("../../models/BillingUsers");
const BillingValueGroups = require("../../models/BillingValueGroups");

const UserValidator = require("../../validators/user");

const afterResponse = require("../../helpers/afterResponse");
const sendMail = require("../../helpers/mailer");

/** List all users */
router.get(
  "/list",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "readAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const usersPromise = Users.find({}).select({
        _id: 1,
        user_id: 1,
        name: 1,
        email: 1,
        role: 1,
        confirmed: 1,
        avatarUrl: 1,
      });

      const groupsPromise = Groups.find({});
      const userGroupsPromise = UserGroups.find({});
      const billingUsersPromise = BillingUsers.find({});
      const billingValueGroupsPromise = BillingValueGroups.find({});

      const [users, groups, userGroups, billingUsers, billingValueGroups] =
        await Promise.all([
          usersPromise,
          groupsPromise,
          userGroupsPromise,
          billingUsersPromise,
          billingValueGroupsPromise,
        ]);

      const usersData = users.map((user) => {
        const _userGroups = userGroups
          .filter(({ user_id }) => user_id === user.user_id)
          .map((userGroup) => {
            return groups.find(
              (group) => group.group_id === userGroup.group_id
            );
          });
        const userBillingData = billingUsers.find(
          ({ user_email }) => user.email === user_email
        );

        if (!userBillingData) {
          return {
            _id: user._id,
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            confirmed: user.confirmed,
            avatarUrl: user.avatarUrl || null,
            groups: _userGroups,
            billingData: null,
          };
        }

        const userBillingGroup = billingValueGroups.find(
          ({ id }) => id === userBillingData.billing_group_id
        );

        const _billingData = {
          id: userBillingData.id,
          billingMail: userBillingData.user_billing_email,
          active: userBillingData.active,
          billingGroup: {
            id: userBillingGroup.id,
            name: userBillingGroup.name,
            value: userBillingGroup.value,
          },
        };

        return {
          _id: user._id,
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          confirmed: user.confirmed,
          avatarUrl: user.avatarUrl || null,
          groups: _userGroups,
          billingData: _billingData,
        };
      });

      return res.status(200).json(usersData);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

/** Create new user */
router.post(
  "/create",
  authMiddleware,
  groupsMiddleware,
  validator.body(UserValidator.create),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "createAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { body } = req;
      const { name, email, userGroups, paymentGroup } = body;

      const userAlreadyExists = await Users.findOne({
        email,
      });

      if (userAlreadyExists) {
        return res.status(400).json({
          message: "O usuário já foi cadastrado.",
        });
      }

      const id = uuid();

      const user = { user_id: id, name, email };
      await Users.create(user);
      // TODO: criar validação de grupo de usuário
      for (const group_id of userGroups) {
        await UserGroups.create({
          group_id,
          user_id: id,
        });
      }
      // TODO: criar validação de grupo de pagamento
      await BillingUsers.create({
        id: uuid(),
        user_name: name,
        user_email: email,
        user_billing_email: email,
        billing_group_id: paymentGroup,
      });

      await sendMail(
        user.email,
        "Confirme sua Conta - Comunidade Ògún Onirê",
        "userconfirmation",
        {
          user_id: user.user_id,
        }
      );
      return res.status(201).json({ message: "Usuário criado com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

/** Update user */
router.put(
  "/update",
  authMiddleware,
  groupsMiddleware,
  validator.body(UserValidator.update),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny", "/v2/user/update")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const updatedUserData = { ...req.body };
      const user = await Users.findOne({
        user_id: updatedUserData.user_id,
      }).select({
        email: 1,
      });
      if (!user) {
        return res.status(400).json({
          message: "O usuário não existe.",
        });
      }

      await Users.findOneAndUpdate(
        { user_id: updatedUserData.user_id },
        updatedUserData
      );
      await BillingUsers.findOneAndUpdate(
        { user_email: user.email },
        { user_email: updatedUserData.email }
      );

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
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

/** Delete user */
router.delete(
  "/:user_id/delete",
  authMiddleware,
  groupsMiddleware,
  validator.query(UserValidator.delete),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny", "/v2/user/delete")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { user_id } = req.params;
      const user = await Users.findOne({
        user_id,
      }).select({ _id: 1, email: 1 });

      if (!user) {
        return res.status(400).json({
          message: "O usuário não existe.",
        });
      }

      await Users.deleteOne({ user_id });
      await BillingUsers.deleteOne({ user_email: user.email });
      await UserGroups.deleteMany({ user_id });

      return res.status(200).json({ message: "Usuário removido com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

module.exports = (app) => app.use("/v2/user", router);
