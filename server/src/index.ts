import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// 🔹 Ruta API de prueba
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

// 🔹 Servir frontend (build de React)
const clientBuildPath = path.join(__dirname, "../public");

app.use(express.static(clientBuildPath));

// 🔹 Para cualquier ruta que no sea /api, devolver index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// 🔹 Arranque
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});