const paymentAPI = require("../../services/payment");

const BillingUsers = require("../../models/BillingUsers");
const BillingValueGroups = require("../../models/BillingValueGroups");

const SchedulerLogs = require("../../models/SchedulerLogs");

async function billingScheduler(startedAt = new Date()) {
  try {
    await SchedulerLogs.create({
      logDate: new Date(),
      message: "BillingScheduler started",
      status: "RUNNING",
    });
    const date = new Date(startedAt);
    date.setMonth(date.getMonth() + 1, 5);
    const paymentDateObject = {
      dueDate: date.toJSON().split("T")[0],
      period: date.toLocaleDateString().substring(3),
    };

    const billingValueGroups = await BillingValueGroups.find();

    const billingUsers = await BillingUsers.find({ active: true });

    const billingData = billingUsers.map((user) => {
      const group = billingValueGroups.find(
        ({ id }) => id === user.billing_group_id
      );
      return {
        id: user.id,
        user_name: user.user_name,
        user_billing_email: user.user_billing_email,
        billing_value: group.value,
      };
    });

    await SchedulerLogs.create({
      logDate: new Date(),
      message: `Users Billing Data successfully retrieved.`,
      status: "RUNNING",
      payload: JSON.stringify(billingData),
    });

    const success = [];
    const errors = [];
    for (const userBillingData of billingData) {
      await SchedulerLogs.create({
        logDate: new Date(),
        message: `Retrieving client data by email - ${userBillingData.user_billing_email}`,
        status: "RUNNING",
      });
      const { data } = await getClientByEmail(
        userBillingData.user_billing_email
      );
      if (data.length > 0) {
        const chargePayload = makePaymentPayload(
          data[0],
          userBillingData.billing_value,
          paymentDateObject.dueDate,
          paymentDateObject.period
        );
        await SchedulerLogs.create({
          logDate: new Date(),
          message: `Creating new charge for client - ${userBillingData.user_name} ${userBillingData.user_billing_email}`,
          status: "PARTIAL SUCCESS",
          payload: JSON.stringify(chargePayload),
        });
        await createNewCharge(chargePayload);
        success.push(chargePayload);
      } else {
        await SchedulerLogs.create({
          logDate: new Date(),
          message: `User ${userBillingData.user_name} ${userBillingData.user_billing_email} was not found in payment system.`,
          status: "PARTIAL ERROR",
          payload: JSON.stringify(userBillingData),
        });
        errors.push(userBillingData);
      }
    }

    await SchedulerLogs.create({
      logDate: new Date(),
      message: `Users Charges sent successfully. Check the logs for potential errors.`,
      status: "SUCCESS",
      payload: JSON.stringify({ errors, success }),
    });
  } catch (err) {
    console.log(err);
    await SchedulerLogs.create({
      logDate: new Date(),
      message: `Users Billings failed to process. Check previous logs for more info.`,
      status: "ERROR",
    });
  }
}

async function getClientByEmail(email) {
  try {
    const response = await paymentAPI.get("/customers?email=" + email);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function createNewCharge(payload) {
  try {
    const response = await paymentAPI.post("/payments", payload);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function makePaymentPayload(customer, value, dueDate, period) {
  return {
    billingType: "PIX",
    interest: { value: 1 },
    customer: customer.id,
    value,
    dueDate,
    description: `Mensalidade referente ao período ${period}`,
  };
}

module.exports = billingScheduler;
