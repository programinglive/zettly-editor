import "../style.css";
import "@programinglive/zettly-editor/styles";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
