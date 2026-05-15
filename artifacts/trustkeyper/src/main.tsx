import { createRoot } from "react-dom/client";
import App from "./App";
import { initAppStorage } from "./lib/initAppStorage";
import "./index.css";

initAppStorage();

createRoot(document.getElementById("root")!).render(<App />);
