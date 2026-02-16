"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.json());
// 🔹 Ruta API de prueba
app.get("/api/health", (req, res) => {
    res.json({ message: "Backend running 🚀" });
});
// 🔹 Siempre lo último
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
