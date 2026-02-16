import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// 🔹 Ruta API de prueba
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

// 🔹 Servir frontend compilado
const clientBuildPath = path.join(__dirname, "../../client/dist");

app.use(express.static(clientBuildPath));

// 🔹 Cualquier otra ruta → index.html (para React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// 🔹 Siempre lo último
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});