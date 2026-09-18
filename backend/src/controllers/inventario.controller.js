const db = require("../config/db");

const resumenInventario = async (req, res) => {
  try {

    const [[resumen]] = await db.query(`
      SELECT
        COUNT(*) AS total_productos,
        IFNULL(SUM(stock), 0) AS stock_total,
        SUM(CASE WHEN stock > 5 THEN 1 ELSE 0 END) AS disponibles,
        SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) AS stock_bajo,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS agotados
      FROM productos
      WHERE activo = 1
    `);

    const [productosStockBajo] = await db.query(`
      SELECT
        id,
        nombre,
        stock,
        imagen
      FROM productos
      WHERE activo = 1
      AND stock > 0
      AND stock <= 5
      ORDER BY stock ASC
    `);

    const [productosAgotados] = await db.query(`
      SELECT
        id,
        nombre,
        stock,
        imagen
      FROM productos
      WHERE activo = 1
      AND stock = 0
      ORDER BY nombre ASC
    `);

    res.json({
      resumen,
      productos_stock_bajo: productosStockBajo,
      productos_agotados: productosAgotados,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      mensaje: "Error al obtener inventario",
      error: error.message,
    });
  }
};

module.exports = {
  resumenInventario,
};