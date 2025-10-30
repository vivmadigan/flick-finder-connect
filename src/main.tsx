import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDebugMode } from "./lib/debug.ts";

// Initialize debug logging
initDebugMode();

createRoot(document.getElementById("root")!).render(<App />);
