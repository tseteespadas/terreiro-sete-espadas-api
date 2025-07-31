const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const GiraAberta = require("../models/GiraAberta");
const GiraAbertaValidator = require("../validators/giraAberta");

const afterResponse = require("../helpers/afterResponse");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

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

router.delete(
  "/:id",
  authMiddleware,
  groupsMiddleware,
  validator.params(GiraAbertaValidator.paramId),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny", "/giras")) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      const gira = await GiraAberta.findById(req.params.id, "assistencia");

      if (!gira) return res.status(404).json({ error: "Gira não encontrada." });
      await gira.remove();

      res.status(204).json({ message: "Gira excluída com sucesso." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível excluir a gira.",
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

router.get(
  "/assistencia",
  authMiddleware,
  validator.query(GiraAbertaValidator.queryName),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const nomeBuscado = req.query.name;
      const pessoasFiltradas = await GiraAberta.aggregate([
        { $unwind: "$assistencia" },
        {
          $match: {
            "assistencia.name": { $regex: nomeBuscado, $options: "i" }, // busca case-insensitive
          },
        },
        {
          $group: {
            _id: "$assistencia.phone", // ou { name, phone }
            name: { $first: "$assistencia.name" },
            phone: { $first: "$assistencia.phone" },
            pronoums: { $first: "$assistencia.pronoums" },
            preferred: { $first: "$assistencia.preferred" },
            id: { $first: "$assistencia._id" },
          },
        },
        { $sort: { name: 1 } },
      ]);
      res.json(pessoasFiltradas);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar as pessoas.",
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

router.patch(
  "/:giraId/assistencia/:assistenciaId/called",
  authMiddleware,
  validator.params(GiraAbertaValidator.patchCalledParams),
  validator.body(GiraAbertaValidator.patchCalledBody),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const { giraId, assistenciaId } = req.params;
      const { called } = req.body;
      const updatedGira = await GiraAberta.findOneAndUpdate(
        { _id: giraId, "assistencia._id": assistenciaId },
        {
          $set: {
            "assistencia.$.called": called,
          },
        },
        { new: true }
      );

      if (!updatedGira) {
        return res
          .status(404)
          .json({ error: "Gira ou assistência não encontrada." });
      }

      const updatedAssistencia = updatedGira.assistencia.id(assistenciaId);
      if (!updatedAssistencia) {
        return res.status(404).json({ error: "Assistência não encontrada." });
      }

      return res.status(200).json(updatedAssistencia);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível alterar o atributo.",
      });
    }
  })
);

router.delete(
  "/:giraId/assistencia/:assistenciaId",
  authMiddleware,
  groupsMiddleware,
  validator.params(GiraAbertaValidator.patchCalledParams),
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (!permissionMiddleware(req, "deleteAny", "/giras")) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      const { giraId, assistenciaId } = req.params;

      const updatedGira = await GiraAberta.findByIdAndUpdate(
        giraId,
        {
          $pull: { assistencia: { _id: assistenciaId } },
        },
        { new: true }
      );

      if (!updatedGira) {
        return res.status(404).json({ message: "Gira não encontrada." });
      }

      const assistenciaAindaExiste = updatedGira.assistencia.id(assistenciaId);
      if (assistenciaAindaExiste) {
        return res
          .status(500)
          .json({ message: "Falha ao remover a assistência." });
      }

      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível excluir a assistência.",
      });
    }
  })
);

module.exports = (app) => app.use("/giras", router);
