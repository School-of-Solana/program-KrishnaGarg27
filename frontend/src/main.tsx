import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWalletProvider } from "./provider/WalletProvider.tsx";
import "./index.css";
import "./lib/polyfills.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWalletProvider>
      <App />
    </AppWalletProvider>
  </StrictMode>
);
