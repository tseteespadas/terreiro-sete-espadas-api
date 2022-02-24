const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const CourseRegistration = require("../models/courseRegistration");
const Course = require("../models/course");
const CourseRegistrationValidator = require("../validators/courseRegistration");

const afterResponse = require("../helpers/afterResponse");

router.get(
  "/listar/:courseId",
  validator.params(CourseRegistrationValidator.courseId),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { courseId } = req.params;

      const assistencia = await CourseRegistration.find({
        courseId,
      });

      return res.json({ assistencia });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar a assistência para o grupo informado.",
      });
    }
  })
);

router.post(
  "/inscricao/:courseId",
  validator.params(CourseRegistrationValidator.courseId),
  validator.body(CourseRegistrationValidator.post),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { courseId } = req.params;

      const curso = await Course.findById(courseId);
      if (!curso) {
        return res.status(400).json({ error: "O curso não existe." });
      }

      const { startAt, subscriptionDateLimit } = curso;
      if (new Date(startAt) < new Date()) {
        return res.status(400).json({
          error: "Não é possível se inscrever em um curso passado.",
        });
      }

      if (new Date(subscriptionDateLimit) < new Date()) {
        return res.status(400).json({
          error: "Inscrições encerradas.",
        });
      }

      const registrado = await CourseRegistration.findOne({
        courseId,
        email: req.body.email,
      });
      if (registrado) {
        return res.status(400).json({ error: "Inscrição já realizada." });
      }

      const inscricao = await CourseRegistration.create(req.body);
      return res.status(201).json({ inscricao });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível se inscrever para o curso informada.",
      });
    }
  })
);

module.exports = (app) => app.use("/cursos", router);
