const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");

const Users = require("../models/Users");
const UserValidator = require("../validators/user");

const afterResponse = require("../helpers/afterResponse");
const sendMail = require("../helpers/mailer");

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
        avatarUrl: 1,
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
          avatarUrl: user.avatarUrl,
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

module.exports = (app) => app.use("/user", router);
