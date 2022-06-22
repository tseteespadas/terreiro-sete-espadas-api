require("dotenv").config(); // setting up the env vars
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("./controllers/giraNotificationController")(app);
require("./controllers/desenvolvimentoCourseController")(app);
require("./controllers/desenvolvimentoCourseRegistrationController")(app);
require("./controllers/umbandaCourseController")(app);
require("./controllers/umbandaCourseRegistrationController")(app);
require("./controllers/zePelintraCourseController")(app);
require("./controllers/zePelintraCourseRegistrationController")(app);

require("./scheduler").scheduler();

app.listen(process.env.PORT || 8080)
