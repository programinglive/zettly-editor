import "../style.css";
import "@programinglive/zettly-editor/styles";

import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import { App } from "./app";

Sentry.init({
  dsn: "https://d9fc8ff5708a4478e430a4441c1d2463@o4506191621586944.ingest.us.sentry.io/4510238303846400",
  sendDefaultPii: true,
});

const container = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
