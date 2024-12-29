const express = require("express");
const handle = require("express-async-handler");
const { v4: uuid } = require("uuid");

const router = express.Router();

const authMiddleware = require("../middlewares/auth");
const groupsMiddleware = require("../middlewares/groups");
const permissionMiddleware = require("../middlewares/permission");

const afterResponse = require("../helpers/afterResponse");

const playlists = [
  {
    id: uuid(),
    type: "section",
    title: "Ancestrais",
    medias: [
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29zmm_PzAKsKvEptr9ElWQB4",
        title: "Malandragem",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29ySq_NVrtxbhxbNFP81xOb_",
        title: "Pretos Velhos",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29yR-zwIKhOCKyUE3wgTmDUg",
        title: "Exú",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29z9ooI0mLY3TWHEy-WMAkLr",
        title: "Povo do mar",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29waUTFPr4_vKr9ddW-j8PGQ",
        title: "Pombagira",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29zN_6s98rD_08EMA5t20oV2",
        title: "Boiadeiro",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29y4tyPc-H_JlH7NcEegGVv6",
        title: "Erês",
      },
    ],
  },
  {
    id: uuid(),
    type: "section",
    title: "Òrìṣà",
    medias: [
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29wIKwhQRx8uKgy8Dz-D8LQL",
        title: "Ògún",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29xKTw-hz5cr69KRRObkGojG",
        title: "Oyá",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29z-Cbn63wBW0gRzAambUPI8",
        title: "Oṣun",
      },
    ],
  },
  {
    id: uuid(),
    type: "section",
    title: "Rituais",
    medias: [
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29x74Z4awRUHd8EOPriF-CwV",
        title: "Defumação",
      },
      {
        id: uuid(),
        playlistId: "PLu0QKgxGa29yMlwvivldigHdXzdyhNG7_",
        title: "Abertura",
      },
    ],
  },
];

router.get(
  "/",
  authMiddleware,
  groupsMiddleware,
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      if (
        !permissionMiddleware(req, "readOwn") &&
        !permissionMiddleware(req, "readAny")
      ) {
        return res.status(403).json({ message: "Acesso negado." });
      }

      return res.status(200).json(playlists);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "O servidor não conseguiu processar sua solicitação. Entre em contato com um administrador.",
      });
    }
  })
);

module.exports = (app) => app.use("/playlists", router);
