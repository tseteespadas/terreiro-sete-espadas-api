const express = require("express");
const handle = require("express-async-handler");
const sendMail = require("../helpers/mailer");
const afterResponse = require("../helpers/afterResponse");

const fs = require("fs");
const path = require("path");

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
      const fileName = `../../payload-event-${new Date().getTime()}.json`;
      const filePath = path.join(__dirname, fileName);
      fs.writeFileSync(filePath, JSON.stringify(requestBody, null, 2));
      await sendMail(
        "jeff.sarti@reap.hk",
        "New SDK Webhook Payload - Events API",
        null,
        null,
        [
          {
            filename: fileName,
            path: filePath,
          },
        ]
      );
      fs.rmSync(filePath);
      return res.json({ ok: true });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Something went wrong.",
      });
    }
  })
);

module.exports = (app) => app.use("/sdk/webhook/events/callback", router);
