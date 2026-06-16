import express from "express";
import path from "path";
import campaignPreflightRoutes from "./routes/tools/campaignPreflight.routes";
import csvCompareRoutes from "./routes/tools/csvCompare.routes";
import formInspectorRoutes from "./routes/tools/formInspector.routes";
import htmlRefactorRoutes from "./routes/tools/html-refactor.routes";
import leadCsvCleanerRoutes from "./routes/tools/leadCsvCleaner.routes";
import payloadInspectorRoutes from "./routes/tools/payloadInspector.routes";
import trackingInspectorRoutes from "./routes/tools/trackingInspector.routes";
import urlStatusCheckerRoutes from "./routes/tools/urlStatusChecker.routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "2mb" }));

// 🔹 Ruta API de prueba
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

// 🔹 Tools API
app.use("/api/tools/campaign-preflight", campaignPreflightRoutes);
app.use("/api/tools/csv-compare", csvCompareRoutes);
app.use("/api/tools/form-inspector", formInspectorRoutes);
app.use("/api/tools/html-refactor", htmlRefactorRoutes);
app.use("/api/tools/lead-csv-cleaner", leadCsvCleanerRoutes);
app.use("/api/tools/payload-inspector", payloadInspectorRoutes);
app.use("/api/tools/tracking-inspector", trackingInspectorRoutes);
app.use("/api/tools/url-status-checker", urlStatusCheckerRoutes);

// 🔹 Servir frontend (build de React)
const clientBuildPath = path.join(__dirname, "../public");

console.log("Serving static from:", clientBuildPath);

app.use(express.static(clientBuildPath));

// 🔹 Para cualquier ruta que no sea /api, devolver index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// 🔹 Arranque
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
