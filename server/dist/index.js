"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const campaignPreflight_routes_1 = __importDefault(require("./routes/tools/campaignPreflight.routes"));
const csvCompare_routes_1 = __importDefault(require("./routes/tools/csvCompare.routes"));
const formInspector_routes_1 = __importDefault(require("./routes/tools/formInspector.routes"));
const html_refactor_routes_1 = __importDefault(require("./routes/tools/html-refactor.routes"));
const leadCsvCleaner_routes_1 = __importDefault(require("./routes/tools/leadCsvCleaner.routes"));
const payloadInspector_routes_1 = __importDefault(require("./routes/tools/payloadInspector.routes"));
const trackingInspector_routes_1 = __importDefault(require("./routes/tools/trackingInspector.routes"));
const urlStatusChecker_routes_1 = __importDefault(require("./routes/tools/urlStatusChecker.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use(express_1.default.json({ limit: "2mb" }));
// 🔹 Ruta API de prueba
app.get("/api/health", (req, res) => {
    res.json({ message: "Backend running 🚀" });
});
// 🔹 Tools API
app.use("/api/tools/campaign-preflight", campaignPreflight_routes_1.default);
app.use("/api/tools/csv-compare", csvCompare_routes_1.default);
app.use("/api/tools/form-inspector", formInspector_routes_1.default);
app.use("/api/tools/html-refactor", html_refactor_routes_1.default);
app.use("/api/tools/lead-csv-cleaner", leadCsvCleaner_routes_1.default);
app.use("/api/tools/payload-inspector", payloadInspector_routes_1.default);
app.use("/api/tools/tracking-inspector", trackingInspector_routes_1.default);
app.use("/api/tools/url-status-checker", urlStatusChecker_routes_1.default);
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
