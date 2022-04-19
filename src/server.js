"use strict";

const bodyParser = require("body-parser");
const morgan = require("morgan");
const express = require("express");
const app = express();

// app.use(morgan("dev"));
app.use(bodyParser.json());

app.use(require("./routes/poll.js"));
app.use(require("./routes/vote.js"));

module.exports = (port = 8081)=>{
    app.listen(port, ()=>console.log(process.pid, "Poller listening on", port));
}