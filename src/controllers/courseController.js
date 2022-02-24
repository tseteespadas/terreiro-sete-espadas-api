const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const Course = require("../models/course");
const CourseValidator = require("../validators/course");

const afterResponse = require("../helpers/afterResponse");

router.get(
  "/listar",
  validator.query(CourseValidator.get),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));

      const { name, startAt } = req.query;
      let courses;

      if (name && startAt) {
        courses = await Course.find({
          name: { $regex: name, $options: "i" },
          startAt,
        }).sort({ startAt: -1 });
        return res.json({ courses });
      } else if (name) {
        courses = await Course.find({
          name: { $regex: name, $options: "i" },
        }).sort({ startAt: -1 });
        return res.json({ courses });
      } else if (startAt) {
        courses = await Course.find({ startAt }).sort({ startAt: -1 });
        return res.json({ courses });
      }

      courses = await Course.find().sort({ startAt: -1 });
      return res.json({ courses });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Não foi possível listar os cursos." });
    }
  })
);

router.post(
  "/criar",
  validator.body(CourseValidator.post),
  handle(async (req, res) => {
    res.on("finish", () => afterResponse(req, res));
    try {
      const course = await Course.create(req.body);
      return res.status(201).json({ course });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Não foi possível criar o curso." });
    }
  })
);

module.exports = (app) => app.use("/cursos", router);
