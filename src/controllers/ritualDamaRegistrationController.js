const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const DamaRitual = require("../models/DamaRitual");
const DamaRitualRegistration = require("../models/DamaRitualRegistration");
const CoursesRegistrationValidator = require("../validators/coursesRegistration");

const sendMail = require("../helpers/mailer");
const afterResponse = require("../helpers/afterResponse");

router.get(
  "/inscritos/:courseId",
  validator.params(CoursesRegistrationValidator.courseId),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { courseId } = req.params;

      const inscritos = await DamaRitualRegistration.find({
        course_id: courseId,
      });

      return res.json({ inscritos });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar os inscritos para o ritual informado.",
      });
    }
  })
);

router.post(
  "/nova",
  validator.body(CoursesRegistrationValidator.postResumed),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { course_id, name, email } = req.body;

      const exists = await DamaRitual.findById(course_id);
      if (!exists) {
        return res.status(404).json({ error: "O ritual não existe." });
      }

      const alreadyRegistered = await DamaRitualRegistration.findOne({
        email,
        course_id,
      });

      if (alreadyRegistered) {
        return res
          .status(400)
          .json({ error: "Você já se inscreveu para esse ritual. " });
      }

      const inscricao = await DamaRitualRegistration.create(req.body);
      await Promise.all([
        sendMail(
          email,
          "Comunidade Ògún Onirê - Confirmação de Inscrição no Ritual de Defuntaria de Dama da Noite",
          "courseconfirm",
          {
            nome: name,
            curso: "Ritual de Defuntaria de Dama da Noite",
            tipoEvento: "ritual",
          },
          null
        ),
        sendMail(
          "comunidadeonire@gmail.com",
          "Comunidade Ògún Onirê - Nova Inscrição no Ritual de Defuntaria de Dama da Noite",
          "courseconfirmself",
          {
            ...req.body,
            curso: "Ritual de Defuntaria de Dama da Noite",
            tipoEvento: "ritual",
          },
          null
        ),
        sendMail(
          email,
          "Comunidade Ògún Onirê - Instruções de Pagamento Ritual de Defuntaria de Dama da Noite",
          "dama-ritual-event-payment",
          {
            ...req.body,
            nome: name,
            curso: "Ritual de Defuntaria de Dama da Noite",
            tipoEvento: "ritual",
          },
          null
        ),
      ]);
      return res.status(201).json({ inscricao });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível realizar a inscrição para o ritual.",
      });
    }
  })
);

module.exports = (app) =>
  app.use("/rituais/defuntaria-dama-da-noite/inscricoes", router);
