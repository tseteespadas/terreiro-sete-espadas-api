const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const RitualFimAno = require("../models/RitualFimAno");
const CoursesValidator = require("../validators/courses");

const afterResponse = require("../helpers/afterResponse");

router.get(
  "/listar",
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));

      const cursos = await RitualFimAno.find({});

      return res.json({ cursos });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar os cursos.",
      });
    }
  })
);

router.post(
  "/novo",
  validator.body(CoursesValidator.post),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));

      const novoCurso = await RitualFimAno.create(req.body);
      return res.status(201).json({ novoCurso });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível criar o curso.",
      });
    }
  })
);

module.exports = (app) => app.use("/cursos/ritual2025", router);
