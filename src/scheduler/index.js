const cron = require('node-cron');

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
}

module.exports = Object.freeze({
  scheduler
});
