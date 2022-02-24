require("dotenv").config(); // setting up the env vars
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("./controllers/giraController")(app);
require("./controllers/giraRegistrationController")(app);

app.listen(process.env.PORT || 8080)
