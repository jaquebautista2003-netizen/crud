const db = require("../config/db");

const obtenerProductos = async (req, res) => {
    try {
        const [productos] = await db.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.imagen,
        p.categoria_id,
        c.nombre AS categoria,
        p.talla,
        p.color,
        p.stock,
        p.fecha_registro
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
      ORDER BY p.id DESC
    `);

        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener productos",
            error: error.message,
        });
    }
};

const crearProducto = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio,
            categoria_id,
            talla,
            color,
            stock,
        } = req.body;

        const imagen = req.file ? `/uploads/productos/${req.file.filename}` : "";

        if (!nombre || !precio || !categoria_id) {
            return res.status(400).json({
                mensaje: "Nombre, precio y categoría son obligatorios",
            });
        }

        if (Number(precio) < 0) {
            return res.status(400).json({
                mensaje: "El precio no puede ser negativo",
            });
        }

        if (Number(stock) < 0) {
            return res.status(400).json({
                mensaje: "El stock no puede ser negativo",
            });
        }

        const [resultado] = await db.query(
            `
      INSERT INTO productos
      (nombre, descripcion, precio, imagen, categoria_id, talla, color, stock, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
            [
                nombre,
                descripcion || "",
                precio,
                imagen,
                categoria_id,
                talla || "",
                color || "",
                stock || 0,
            ]
        );

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            id: resultado.insertId,
            imagen,
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al crear producto",
            error: error.message,
        });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            descripcion,
            precio,
            categoria_id,
            talla,
            color,
            stock,
        } = req.body;

        if (Number(precio) < 0) {
            return res.status(400).json({
                mensaje: "El precio no puede ser negativo",
            });
        }

        if (Number(stock) < 0) {
            return res.status(400).json({
                mensaje: "El stock no puede ser negativo",
            });
        }

        let imagen = req.body.imagen_actual || "";

        if (req.file) {
            imagen = `/uploads/productos/${req.file.filename}`;
        }

        await db.query(
            `
      UPDATE productos
      SET nombre = ?, descripcion = ?, precio = ?, imagen = ?, categoria_id = ?, talla = ?, color = ?, stock = ?
      WHERE id = ?
      `,
            [
                nombre,
                descripcion || "",
                precio,
                imagen,
                categoria_id,
                talla || "",
                color || "",
                stock || 0,
                id,
            ]
        );

        res.json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar producto",
            error: error.message,
        });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "UPDATE productos SET activo = 0 WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado",
            });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar producto",
            error: error.message,
        });
    }
};

const obtenerCategorias = async (req, res) => {
    try {
        const [categorias] = await db.query(
            "SELECT * FROM categorias ORDER BY nombre ASC"
        );

        res.json(categorias);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener categorías",
            error: error.message,
        });
    }
};

module.exports = {
    obtenerProductos,
    crearProducto,
    obtenerCategorias,
    actualizarProducto,
    eliminarProducto,
};