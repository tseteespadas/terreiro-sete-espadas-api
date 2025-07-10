require("dotenv").config(); // setting up the env vars
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Comunidade Ògún Onirê API");
});

require("./controllers/giraNotificationController")(app);
require("./controllers/desenvolvimentoCourseController")(app);
require("./controllers/desenvolvimentoCourseRegistrationController")(app);
require("./controllers/umbandaCourseController")(app);
require("./controllers/umbandaCourseRegistrationController")(app);
require("./controllers/zePelintraCourseController")(app);
require("./controllers/zePelintraCourseRegistrationController")(app);
require("./controllers/ervasCourseController")(app);
require("./controllers/ervasCourseRegistrationController")(app);
require("./controllers/ritualFimAnoController")(app);
require("./controllers/ritualFimAnoRegistrationController")(app);
require("./controllers/ritualDamaController")(app);
require("./controllers/ritualDamaRegistrationController")(app);

require("./controllers/billingGroupController")(app);
require("./controllers/billingUserController")(app);

require("./controllers/userController")(app);
require("./controllers/groupController")(app);
require("./controllers/eventController")(app);
require("./controllers/playlistsController")(app);
require("./controllers/galleryController")(app);

require("./controllers/v2/userController")(app);

app.listen(process.env.PORT || 8080);

const scheduler = require("./scheduler");
scheduler();

module.exports = app;
