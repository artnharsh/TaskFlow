import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ui/ErrorBoundary";

// Apply persisted preferences before first paint.
if (localStorage.getItem("pref-reduced-motion") === "true") {
  document.documentElement.dataset.reduceMotion = "true";
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
