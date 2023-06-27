const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

const Users = require("../models/Users");
const Groups = require("../models/Groups");
const UserGroups = require("../models/UserGroups");
const UserValidator = require("../validators/user");

const afterResponse = require("../helpers/afterResponse");
const sendMail = require("../helpers/mailer");

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
      const users = await Users.find({}).select({
        _id: 1,
        user_id: 1,
        name: 1,
        email: 1,
        role: 1,
        confirmed: 1,
      });

      const userGroups = [];
      // for (const user of users) {
      //   const groupIds = await UserGroups.find({ user_id: user.user_id });
      //   const groups = await Groups.find({
      //     group_id: groupIds.map(({ group_id }) => group_id),
      //   });

      //   userGroups.push({
      //     user,
      //     groups,
      //   });
      // }

      return res.status(200).json(users);
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
      const userAlreadyExists = await Users.findOne({
        email: body.email,
      });

      if (userAlreadyExists) {
        return res.status(400).json({
          message: "O usuário já foi cadastrado.",
        });
      }

      const id = uuid();
      const user = { ...req.body };
      user.user_id = id;
      await Users.create(user);
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

router.delete(
  "/",
  authMiddleware,
  groupsMiddleware,
  validator.query(UserValidator.delete),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const { user_id } = req.query;
      const userExists = await Users.findOne({
        user_id,
      }).select({ _id: 1 });

      if (!userExists) {
        return res.status(400).json({
          message: "O usuário não existe.",
        });
      }

      await Users.deleteOne({ user_id });
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

router.post(
  "/login",
  validator.body(UserValidator.login),
  handle(async (req, res) => {
    try {
      const { email, password } = req.body;
      res.on("finish", () => afterResponse(req, res));
      const user = await Users.findOne({
        email,
      }).select({
        _id: 0,
        user_id: 1,
        email: 1,
        password: 1,
        name: 1,
        role: 1,
      });

      if (!user) {
        return res.status(401).json({
          message: "Credenciais inválidas",
        });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({
          message: "Credenciais inválidas",
        });
      }

      const token = jwt.sign(
        {
          user: {
            user_id: user.user_id,
            email: user.email,
          },
        },
        process.env.API_SECRET,
        {
          expiresIn: "1d",
        }
      );

      await Users.findOneAndUpdate(
        {
          user_id: user.user_id,
        },
        {
          token,
        }
      );

      return res.status(200).json({
        token,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
        menu: require("../helpers/menu.js")[user.role],
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
  "/logout",
  authMiddleware,
  handle(async (req, res) => {
    try {
      const { user_id } = req.user;
      res.on("finish", () => afterResponse(req, res));
      const user = await Users.findOne({
        user_id,
      });

      if (!user) {
        return res.status(400).json({
          message:
            "Não é possível fazer logout. Entre em contato com um administrador.",
        });
      }

      await Users.findOneAndUpdate(
        {
          user_id: user.user_id,
        },
        {
          token: "",
        }
      );

      return res.status(200).json({ message: "Logout realizado com sucesso." });
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
  "/confirm",
  validator.body(UserValidator.confirm),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const user = { ...req.body };
      const userExists = await Users.findOne({
        user_id: user.user_id,
        confirmed: false,
      });
      if (!userExists) {
        return res.status(422).json({
          message:
            "O usuário não existe ou já realizou a confirmação da conta.",
        });
      }
      const plainPassword = user.password;
      const salt = bcrypt.genSaltSync(16);
      const hash = bcrypt.hashSync(user.password, salt);
      user.password = hash;
      user.confirmed = true;
      user.updatedAt = new Date();
      await Users.findOneAndUpdate({ user_id: user.user_id }, user);
      await sendMail(
        userExists.email,
        "Dados da Conta - Comunidade Ògún Onirê",
        "useraccountinfo",
        {
          email: userExists.email,
          password: plainPassword,
        }
      );
      return res.status(200).json({
        message:
          "Usuário confirmado com sucesso. Agora você pode fazer login normalmente.",
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

router.put(
  "/",
  authMiddleware,
  validator.body(UserValidator.update),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "updateAny")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const user = { ...req.body };
      const userExists = await Users.findOne({
        user_id: user.user_id,
      });
      if (!userExists) {
        return res.status(400).json({
          message: "O usuário não existe.",
        });
      }

      await Users.findOneAndUpdate({ user_id: user.user_id }, user);

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

module.exports = (app) => app.use("/user", router);
