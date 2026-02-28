import { forceResetDb } from "@/db/forceResetDb";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { resetDbOnce } from "@/db/resetDb";
import App from "./App";
if (new URLSearchParams(window.location.search).get("resetDb") === "1") { forceResetDb(); }

if (new URLSearchParams(window.location.search).get("resetDb") === "1") {
  resetDbOnce();
}
if (new URLSearchParams(window.location.search).get("resetDb") === "1") { forceResetDb(); }

const qc = new QueryClient();
if (new URLSearchParams(window.location.search).get("resetDb") === "1") { forceResetDb(); }

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

