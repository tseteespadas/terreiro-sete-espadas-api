const express = require("express");
const handle = require("express-async-handler");
const validator = require("express-joi-validation").createValidator({});

const router = express.Router();

const GiraNotification = require("../models/GiraNotification");
const GiraNotificationValidator = require("../validators/giraNotification");

const afterResponse = require("../helpers/afterResponse");

router.get(
  "/listar",
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const subscribers = await GiraNotification.find({});

      return res.json({ subscribers });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Não foi possível listar os inscritos.",
      });
    }
  })
);

router.post(
  "/subscrever",
  validator.body(GiraNotificationValidator.post),
  handle(async (req, res) => {
    const { name, email, phone } = req.body;
    try {
      res.on("finish", () => afterResponse(req, res));
      const emailNotificationPromise = GiraNotification.find({ email });
      const nameNotificationPromise = GiraNotification.find({ name });
      const phoneNotificationPromise = GiraNotification.find({ phone });
      const [emailReg, nameReg, phoneReg] = await Promise.all([
        emailNotificationPromise,
        nameNotificationPromise,
        phoneNotificationPromise,
      ]);
      const exists = [...emailReg, ...nameReg, ...phoneReg];
      if (exists.length > 0) {
        return res
          .status(400)
          .json({
            error:
              "Inscrição já realizada. Use um nome, email e telefone únicos.",
          });
      }

      const inscricao = await GiraNotification.create(req.body);

      return res.status(201).json({ inscricao });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "Não foi possível se inscrever. Tente novamente e caso o erro volte a ocorrer, entre em contato conosco.",
      });
    }
  })
);

router.delete(`/cancelar/:id`, 
validator.params(GiraNotificationValidator.subscriptionId),
async (req, res) => {
  try {
    res.on("finish", () => afterResponse(req, res));
    const { id } = req.params;
    const subscription = await GiraNotification.findOneAndDelete({ _id: id });
    if (subscription) {
      return res
        .status(200)
        .json({
          message:
            "Inscrição removida com sucesso. Caso deseje voltar a receber alertas sobre as próximas giras, inscreva-se novamente.",
        });
    }

    return res.status(404).json({
      error:
        "A sua inscrição já foi removida. Caso ainda esteja recebendo notificações, entre em contato conosco.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error:
        "Não foi possível cancelar a inscrição. Tente novamente e caso o erro volte a ocorrer, entre em contato conosco.",
    });
  }
});

module.exports = (app) => app.use("/notificacoes", router);
