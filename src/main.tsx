import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { registerSW } from "virtual:pwa-register";
import { FamilyTreePage } from "@/pages/family-tree-page";
import { HomeScreen } from "@/pages/home-screen";
import { NotFound } from "@/pages/not-found";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

// Register service worker with update prompt
const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm("New version available. Reload?")) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log("App ready to work offline");
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <RouteProvider>
                    <Routes>
                        <Route path="/" element={<FamilyTreePage />} />
                        <Route path="/home" element={<HomeScreen />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </RouteProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
