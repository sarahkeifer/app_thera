import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { register } from "@public-ui/components";
import { defineCustomElements } from "@public-ui/components/loader";
import { DEFAULT } from "@public-ui/themes";

import "./index.css";
import App from "./App.tsx";

register(DEFAULT, defineCustomElements);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);