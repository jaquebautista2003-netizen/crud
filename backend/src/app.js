const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const productosRoutes = require("./routes/productos.routes");
const ventasRoutes = require("./routes/ventas.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const reportesRoutes = require("./routes/reportes.routes");
const inventarioRoutes = require("./routes/inventario.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/inventario", inventarioRoutes);


app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS resultado");
    res.json({
      mensaje: "API Rosmeli conectada a MySQL ",
      prueba: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error conectando a MySQL",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});