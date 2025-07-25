const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const GiraAberta = require("../models/GiraAberta");
const GiraAbertaValidator = require("../validators/giraAberta");

const afterResponse = require("../helpers/afterResponse");

function sortAssistencia(assistencia) {
  if (assistencia.length === 0) {
    return [];
  }

  return assistencia.sort((a, b) => {
    if (a.preferred && !b.preferred) {
      return -1;
    } else if (!a.preferred && b.preferred) {
      return 1;
    } else {
      return 0;
    }
  });
}

router.get(
  "/",
  authMiddleware,
  validator.query(GiraAbertaValidator.queryPaginated),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const giras = await GiraAberta.find({}, { assistencia: 0 }) // exclui assistência
        .sort({ date: -1 }) // mais recente primeiro
        .skip(skip)
        .limit(limit);

      const totalGiras = await GiraAberta.countDocuments();

      return res.json({
        giras,
        totalPages: Math.ceil(totalGiras / 10),
        totalGiras,
        currentPage: Number(page),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar as giras.",
      });
    }
  })
);

router.post(
  "/",
  authMiddleware,
  validator.body(GiraAbertaValidator.postGira),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { name, date } = req.body;

      const novaGira = new GiraAberta({ name, date });
      await novaGira.save();

      return res.status(201).json(novaGira);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível criar a gira.",
      });
    }
  })
);

router.get(
  "/:id/assistencia",
  authMiddleware,
  validator.params(GiraAbertaValidator.paramId),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const gira = await GiraAberta.findById(req.params.id, "assistencia");

      if (!gira) return res.status(404).json({ error: "Gira não encontrada." });

      res.json(sortAssistencia(gira.assistencia));
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar os inscritos.",
      });
    }
  })
);

router.post(
  "/:id/assistencia",
  authMiddleware,
  validator.body(GiraAbertaValidator.post),
  handle(async (req, res) => {
    try {
      const gira = await GiraAberta.findById(req.params.id);

      if (!gira) return res.status(404).json({ error: "Gira não encontrada." });

      gira.assistencia.push(req.body); // espera body com: name, phone, pronoums, preferred
      await gira.save();

      res.status(201).json({
        message: "Pessoa adicionada com sucesso.",
        assistencia: gira.assistencia,
      });
    } catch (err) {
      res
        .status(400)
        .json({ error: "Erro ao adicionar pessoa.", details: err.message });
    }
  })
);

module.exports = (app) => app.use("/giras", router);
