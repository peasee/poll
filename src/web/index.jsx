import React from "react";
import ReactDOM from "react-dom";

import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
setChonkyDefaults({ iconComponent: ChonkyIconFA });

import App from "./app";

ReactDOM.render(<App />, document.getElementById("main"));