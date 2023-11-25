const cron = require("node-cron");

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
const BILLING_SCHEDULER = "0 16 25 * *";

const billingScheduler = require("./billingScheduler");

async function scheduler() {
  cron.schedule(BILLING_SCHEDULER, billingScheduler);
}

module.exports = scheduler;
