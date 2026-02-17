"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.json());
// 🔹 Ruta API de prueba
app.get("/api/health", (req, res) => {
    res.json({ message: "Backend running 🚀" });
});
// 🔹 Servir frontend (build de React)
const clientBuildPath = path_1.default.join(__dirname, "../public");
console.log("Serving static from:", clientBuildPath);
app.use(express_1.default.static(clientBuildPath));
// 🔹 Para cualquier ruta que no sea /api, devolver index.html
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(clientBuildPath, "index.html"));
});
// 🔹 Arranque
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
