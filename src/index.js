"use strict";

const bodyParser = require("body-parser");
const morgan = require("morgan");
const express = require("express");
const app = express();

// app.use(morgan("dev"));
app.use(bodyParser.json());

app.use(require("./routes/poll.js"));
app.use(require("./routes/vote.js"));

app.listen(8081, ()=>console.log("Poller listening on", 8081));