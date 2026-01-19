import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
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
    plugins: [react(), tailwindcss(), familyTreeApi()],
    server:{
        port: 7474,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
