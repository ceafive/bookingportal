import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import AuthProvider from "./ctx/Auth";
import AppProvider from "./ctx/App";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import "react-day-picker/lib/style.css";

Sentry.init({
  dsn: "https://3138a16a9bcf467499b64e7f55d0087d@o934257.ingest.sentry.io/5883682",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
