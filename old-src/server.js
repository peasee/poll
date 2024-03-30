"use strict";

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const loadSourceIP = require("./middleware/loadSourceIP");

const app = express();

// app.use(morgan("dev"));
app.use(loadSourceIP);
app.use(bodyParser.json());
app.use(cors());

app.use(require("./routes/poll.js"));
app.use(require("./routes/vote.js"));

module.exports = (port = 8081)=>{
    app.listen(port, ()=>console.log(process.pid, "Poller listening on", port));
}