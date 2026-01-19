import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";
import { defineConfig, type Plugin } from "vite";

function familyTreeApi(): Plugin {
    return {
        name: "family-tree-api",
        configureServer(server) {
            server.middlewares.use("/api/family", (req, res) => {
                const filePath = path.resolve(__dirname, "src/data/family.json");

                if (req.method === "GET") {
                    const data = fs.readFileSync(filePath, "utf-8");
                    res.setHeader("Content-Type", "application/json");
                    res.end(data);
                    return;
                }

                if (req.method === "POST") {
                    let body = "";
                    req.on("data", (chunk) => (body += chunk));
                    req.on("end", () => {
                        try {
                            fs.writeFileSync(filePath, JSON.stringify(JSON.parse(body), null, 4));
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ success: true }));
                        } catch (error) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: "Failed to save data" }));
                        }
                    });
                    return;
                }

                res.statusCode = 405;
                res.end(JSON.stringify({ error: "Method not allowed" }));
            });
        },
    };
}

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        familyTreeApi(),
        VitePWA({
            registerType: "prompt",
            includeAssets: ["logo.png", "apple-touch-icon.png"],
            manifest: {
                name: "Family Tree",
                short_name: "FamilyTree",
                description: "Interactive family tree visualization",
                theme_color: "#7f56d9",
                background_color: "#ffffff",
                display: "standalone",
                orientation: "any",
                start_url: "/",
                icons: [
                    { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-cache",
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "gstatic-fonts-cache",
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                ],
            },
            devOptions: { enabled: true },
        }),
    ],
    server: {
        port: 7474,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
