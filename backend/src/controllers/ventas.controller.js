const db = require("../config/db");

const crearVenta = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { usuario_id, metodo_pago, productos } = req.body;

    if (!productos || productos.length === 0) {
      await connection.rollback();
      return res.status(400).json({ mensaje: "El carrito está vacío" });
    }

    const total = productos.reduce(
      (acc, item) => acc + Number(item.precio) * Number(item.cantidad),
      0
    );

    const [venta] = await connection.query(
      "INSERT INTO ventas (usuario_id, total, metodo_pago) VALUES (?, ?, ?)",
      [usuario_id, total, metodo_pago]
    );

    const venta_id = venta.insertId;

    for (const item of productos) {
      const subtotal = Number(item.precio) * Number(item.cantidad);

      await connection.query(
        `
        INSERT INTO detalle_venta 
        (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
        `,
        [venta_id, item.id, item.cantidad, item.precio, subtotal]
      );

      await connection.query(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [item.cantidad, item.id]
      );
    }

    await connection.commit();

    res.status(201).json({
      mensaje: "Venta realizada correctamente",
      venta_id,
      total,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al realizar venta",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const obtenerVentas = async (req, res) => {
  try {
    const [ventas] = await db.query(`
      SELECT
        v.id,
        v.usuario_id,
        v.total,
        v.metodo_pago,
        v.fecha,
        u.nombre AS usuario
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.id DESC
    `);

    res.json(ventas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener ventas",
      error: error.message,
    });
  }
};

const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const [detalle] = await db.query(
      `
      SELECT 
        dv.id,
        dv.venta_id,
        dv.producto_id,
        p.nombre AS producto,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal
      FROM detalle_venta dv
      LEFT JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
      `,
      [id]
    );

    res.json(detalle);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener detalle de venta",
      error: error.message,
    });
  }
};

const eliminarVenta = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [detalles] = await connection.query(
      "SELECT producto_id, cantidad FROM detalle_venta WHERE venta_id = ?",
      [id]
    );

    if (detalles.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: "Venta no encontrada o sin detalles",
      });
    }

    for (const item of detalles) {
      await connection.query(
        "UPDATE productos SET stock = stock + ? WHERE id = ?",
        [item.cantidad, item.producto_id]
      );
    }

    await connection.query("DELETE FROM detalle_venta WHERE venta_id = ?", [id]);

    await connection.query("DELETE FROM ventas WHERE id = ?", [id]);

    await connection.commit();

    res.json({
      mensaje: "Venta eliminada correctamente y stock restaurado",
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al eliminar venta",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  crearVenta,
  obtenerVentas,
  obtenerDetalleVenta,
  eliminarVenta,
};