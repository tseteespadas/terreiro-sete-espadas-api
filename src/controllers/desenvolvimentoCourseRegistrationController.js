const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const DesenvolvimentoCourse = require("../models/DesenvolvimentoCourse");
const DesenvolvimentoCourseRegistration = require("../models/DesenvolvimentoCourseRegistration");
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

      const inscritos = await DesenvolvimentoCourseRegistration.find({
        course_id: courseId,
      });

      return res.json({ inscritos });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar os inscritos para o curso informado.",
      });
    }
  })
);

router.post(
  "/nova",
  validator.body(CoursesRegistrationValidator.post),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { course_id, name, email } = req.body;

      const exists = await DesenvolvimentoCourse.findById(course_id);
      if (!exists) {
        return res.status(404).json({ error: "O curso não existe." });
      }

      const alreadyRegistered = await DesenvolvimentoCourseRegistration.findOne({
        email,
        course_id,
      });

      if (alreadyRegistered) {
        return res
          .status(400)
          .json({ error: "Você já se inscreveu para esse curso. " });
      }

      const inscricao = await DesenvolvimentoCourseRegistration.create(
        req.body
      );
      await Promise.all([
        sendMail(
          email,
          "Comunidade Ògún Onirê - Confirmação de Inscrição no Curso Desenvolvimento de Terreiro",
          "courseconfirm",
          {
            nome: name,
            curso: "Desenvolvimento de Terreiro",
          },
          null
        ),
        sendMail(
          "comunidadeonire@gmail.com",
          "Comunidade Ògún Onirê - Nova Inscrição no Curso Desenvolvimento de Terreiro",
          "courseconfirmself",
          {
            ...req.body,
            curso: "Desenvolvimento de Terreiro",
          },
          null
        ),
      ]);
      return res.status(201).json({ inscricao });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível realizar a inscrição para o curso.",
      });
    }
  })
);

module.exports = (app) => app.use("/cursos/desenvolvimento/inscricoes", router);
