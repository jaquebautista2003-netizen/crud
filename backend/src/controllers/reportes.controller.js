const db = require("../config/db");

const construirFiltroFechas = (inicio, fin, alias = "fecha") => {
    if (inicio && fin) {
        return {
            where: `WHERE DATE(${alias}) BETWEEN ? AND ?`,
            params: [inicio, fin],
        };
    }

    if (inicio) {
        return {
            where: `WHERE DATE(${alias}) >= ?`,
            params: [inicio],
        };
    }

    if (fin) {
        return {
            where: `WHERE DATE(${alias}) <= ?`,
            params: [fin],
        };
    }

    return {
        where: "",
        params: [],
    };
};

const resumenReportes = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        const filtro = construirFiltroFechas(inicio, fin, "fecha");

        const [[ventasHoy]] = await db.query(`
      SELECT
        COUNT(*) AS total_ventas,
        IFNULL(SUM(total), 0) AS ingresos
      FROM ventas
      WHERE DATE(fecha) = CURDATE()
    `);

        const [[ventasTotales]] = await db.query(
            `
      SELECT
        COUNT(*) AS total_ventas,
        IFNULL(SUM(total), 0) AS ingresos
      FROM ventas
      ${filtro.where}
      `,
            filtro.params
        );

        const [[productosVendidos]] = await db.query(
            `
      SELECT
        IFNULL(SUM(dv.cantidad), 0) AS total_productos
      FROM detalle_venta dv
      INNER JOIN ventas v
        ON dv.venta_id = v.id
      ${construirFiltroFechas(inicio, fin, "v.fecha").where}
      `,
            filtro.params
        );

        res.json({
            ventas_hoy: ventasHoy,
            ventas_totales: ventasTotales,
            productos_vendidos: productosVendidos.total_productos,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener reportes",
            error: error.message,
        });
    }
};

const ventasPorDia = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        const filtro = construirFiltroFechas(inicio, fin, "fecha");

        const [ventas] = await db.query(
            `
      SELECT
        DATE(fecha) AS fecha,
        SUM(total) AS total
      FROM ventas
      ${filtro.where}
      GROUP BY DATE(fecha)
      ORDER BY DATE(fecha)
      `,
            filtro.params
        );

        res.json(ventas);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener ventas por día",
            error: error.message,
        });
    }
};

const topProductos = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        const filtro = construirFiltroFechas(inicio, fin, "v.fecha");

        const [productos] = await db.query(
            `
      SELECT
        p.nombre,
        SUM(dv.cantidad) AS vendidos
      FROM detalle_venta dv
      INNER JOIN productos p
        ON dv.producto_id = p.id
      INNER JOIN ventas v
        ON dv.venta_id = v.id
      ${filtro.where}
      GROUP BY p.id, p.nombre
      ORDER BY vendidos DESC
      LIMIT 5
      `,
            filtro.params
        );

        res.json(productos);
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener top productos",
            error: error.message,
        });
    }
};

module.exports = {
    resumenReportes,
    ventasPorDia,
    topProductos,
};