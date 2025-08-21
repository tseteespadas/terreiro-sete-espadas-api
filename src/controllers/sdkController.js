const express = require("express");
const sendMail = require("../helpers/mailer");
const afterResponse = require("../helpers/afterResponse");

const router = express.Router();

router.get(
  "/",
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const requestHeaders = req.headers;
      const requestBody = req.body;
      console.log("VIA GET");
      console.log(JSON.stringify(requestHeaders, null, 2));
      console.log(JSON.stringify(requestBody, null, 2));
      return res.json({ ok: true });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Something went wrong.",
      });
    }
  })
);

router.post(
  "/",
  handle(async (req, res) => {
    try {
      res.on("finish", () => afterResponse(req, res));
      const requestHeaders = req.headers;
      const requestBody = req.body;
      console.log("VIA POST");
      console.log(JSON.stringify(requestHeaders, null, 2));
      console.log(JSON.stringify(requestBody, null, 2));
      return res.json({ ok: true });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Something went wrong.",
      });
    }
  })
);

module.exports = (app) => app.use("/sdk/webhook", router);
