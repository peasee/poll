import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./app";
import "./styles/main.css";

const container = document.getElementById("main");
const root = createRoot(container);
root.render(<App />);