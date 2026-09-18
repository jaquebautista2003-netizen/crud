const express = require("express");
const router = express.Router();

const {
  obtenerProductos,
  crearProducto,
  obtenerCategorias,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productos.controller");

const upload = require("../middlewares/upload");

router.get("/", obtenerProductos);
router.get("/categorias", obtenerCategorias);
router.post("/", upload.single("imagen"), crearProducto);
router.put("/:id", upload.single("imagen"), actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;