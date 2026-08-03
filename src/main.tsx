import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <FontSizeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
