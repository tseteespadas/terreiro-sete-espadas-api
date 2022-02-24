const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const Gira = require("../models/gira");
const GiraValidator = require("../validators/gira");

const afterResponse = require("../helpers/afterResponse");

router.get(
  "/listar",
  validator.query(GiraValidator.get),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));

      const { name, startAt } = req.query;
      let giras;

      if (name && startAt) {
        giras = await Gira.find({
          name: { $regex: name, $options: "i" },
          startAt,
        }).sort({ startAt: -1 });
        return res.json({ giras });
      }

      if (name) {
        giras = await Gira.find({ name: { $regex: name, $options: "i" } }).sort(
          { startAt: -1 }
        );
        return res.json({ giras });
      }

      if (startAt) {
        giras = await Gira.find({ startAt }).sort({ startAt: -1 });
        return res.json({ giras });
      }

      giras = await Gira.find().sort({ startAt: -1 });
      return res.json({ giras });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Não foi possível listar as giras." });
    }
  })
);

router.get(
  "/proxima",
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      console.log(new Date().toISOString());
      const proxima = await Gira.find({
        startAt: {
          $gte: new Date(),
        },
        registrationStartAt: {
          $lte: new Date(),
        },
      })
        .sort({ startAt: 1 })
        .limit(1);
      return res.json({ proxima });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Não foi possível identificar a próxima gira." });
    }
  })
);

router.post(
  "/criar",
  validator.body(GiraValidator.post),
  handle(async (req, res) => {
    res.on("finish", () => afterResponse(req, res));
    try {
      const gira = await Gira.create(req.body);
      return res.status(201).json({ gira });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Não foi possível criar a gira." });
    }
  })
);

module.exports = (app) => app.use("/gira", router);
