const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const GiraRegistration = require("../models/giraRegistration");
const Gira = require("../models/Gira");
const GiraRegistrationValidator = require("../validators/giraRegistration");

const afterResponse = require("../helpers/afterResponse");
const sendMail = require("../helpers/mailer");

router.get(
  "/listar/:giraId",
  validator.params(GiraRegistrationValidator.giraId),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { giraId } = req.params;

      const assistencia = await GiraRegistration.find({
        giraId,
      });

      return res.json({ assistencia });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar a assistência para a gira informada.",
      });
    }
  })
);

router.post(
  "/inscricao/:giraId",
  validator.params(GiraRegistrationValidator.giraId),
  validator.body(GiraRegistrationValidator.post),
  handle(async (req, res) => {
    const { giraId } = req.params;
    const { name, email, phone } = req.body;
    try {
      res.on("finish", () => afterResponse(req, res));
      const gira = await Gira.findById(giraId);
      if (gira) {
        const { startAt, publicLimit, name: giraName } = gira;
        if (new Date(startAt) < new Date()) {
          return res.status(400).json({
            error: "Não é possível se inscrever em uma gira passada.",
          });
        }

        const assistencia = await GiraRegistration.find({ giraId });
        if (assistencia.length >= publicLimit) {
          return res
            .status(400)
            .json({ error: "Limite de inscrições atingido." });
        }

        const emailRegistrationPromise = GiraRegistration.find({ giraId, email })
        const nameRegistrationPromise = GiraRegistration.find({ giraId, name })
        const phoneRegistrationPromise = GiraRegistration.find({ giraId, phone })
        const [emailReg, nameReg, phoneReg] = await Promise.all([emailRegistrationPromise, nameRegistrationPromise, phoneRegistrationPromise]);
        const registrado = [...emailReg, ...nameReg, ...phoneReg];
        if (registrado.length > 0) {
          return res.status(400).json({ error: "Inscrição já realizada." });
        }

        const inscricao = await GiraRegistration.create(req.body);
        const dataGira = new Date(startAt)
          .toJSON()
          .split("T")[0]
          .split("-")
          .reverse()
          .join("/");
        await sendMail(
          email,
          "Confirmação de Inscrição",
          "giraconfirm",
          {
            nome: name,
            dia: dataGira,
          },
          []
        );

        sendMail(
          "tseteespadas@gmail.com",
          "Nova Inscrição",
          "giraconfirmself",
          {
            gira: giraName,
            name, 
            email,
            phone,
          },
          []
        );

        return res.status(201).json({ inscricao });
      }

      return res.status(400).json({ error: "A gira não existe." });
    } catch (err) {
      console.log(err);
      await GiraRegistration.findOneAndDelete({ giraId, email });
      return res.status(500).json({
        error:
          "Não foi possível se inscrever para a gira informada. Informe um email válido e caso o erro persista, entre em contato conosco.",
      });
    }
  })
);

module.exports = (app) => app.use("/assistencia", router);
