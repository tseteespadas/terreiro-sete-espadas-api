const cron = require('node-cron');
const notificationService = require("../services/notification");
const Gira = require("../models/gira");
const GiraNotification = require("../models/giraNotification");
const sendMail = require("../helpers/mailer");

/**
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *
*/

const NOTIFICATION_CRON_TIME = "0 12 * * 5";

function scheduler() {
  cron.schedule(
    NOTIFICATION_CRON_TIME,
    notificationService.notificationMaker({
      GiraNotificationModel: GiraNotification,
      GiraModel: Gira,
      sendMail
    }).notificationSender
  )
}

module.exports = Object.freeze({
  scheduler
});
