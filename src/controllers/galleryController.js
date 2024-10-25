const express = require("express");
const handle = require("express-async-handler");

const router = express.Router();

const GalleryImages = require("../models/Gallery");

const afterResponse = require("../helpers/afterResponse");

router.get(
  "/",
  handle(async (req, res) => {
    try {
      const { page, maxItems } = req.query;
      res.on("finish", () => afterResponse(req, res));
      const images = await GalleryImages.find(
        {},
        {},
        {
          skip: parseInt(maxItems) * (parseInt(page) - 1),
          limit: parseInt(maxItems),
        }
      );

      return res.status(200).json({ images });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

module.exports = (app) => app.use("/gallery", router);
