const express = require("express");
const router = express.Router();

const {
  resumenInventario,
} = require("../controllers/inventario.controller");

router.get("/resumen", resumenInventario);

module.exports = router;