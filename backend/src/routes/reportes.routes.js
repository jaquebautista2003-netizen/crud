const express = require("express");
const router = express.Router();

const {
    resumenReportes,
    ventasPorDia,
    topProductos,
} = require("../controllers/reportes.controller");

router.get("/resumen", resumenReportes);
router.get("/ventas-dia", ventasPorDia);
router.get("/top-productos", topProductos);

module.exports = router;