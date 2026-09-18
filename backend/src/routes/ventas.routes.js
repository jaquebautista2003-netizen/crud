const express = require("express");
const router = express.Router();

const {
  crearVenta,
  obtenerVentas,
  obtenerDetalleVenta,
  eliminarVenta,
} = require("../controllers/ventas.controller");

router.get("/", obtenerVentas);
router.get("/:id/detalle", obtenerDetalleVenta);
router.post("/", crearVenta);
router.delete("/:id", eliminarVenta);

module.exports = router;