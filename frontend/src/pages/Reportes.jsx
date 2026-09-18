import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  getResumenReportes,
  getVentasPorDia,
  getTopProductos,
} from "../services/reportes.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/Logo.png";

function Reportes() {
  const [datos, setDatos] = useState(null);
  const [ventasDia, setVentasDia] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async (inicio = "", fin = "") => {
    try {
      setCargando(true);
      await Promise.all([
        cargarReportes(inicio, fin),
        cargarVentasDia(inicio, fin),
        cargarTopProductos(inicio, fin),
      ]);
    } finally {
      setCargando(false);
    }
  };

  const cargarReportes = async (inicio = "", fin = "") => {
    try {
      const data = await getResumenReportes(inicio, fin);
      setDatos(data);
    } catch (error) {
      console.log(error);
    }
  };

  const cargarVentasDia = async (inicio = "", fin = "") => {
    try {
      const data = await getVentasPorDia(inicio, fin);

      const formateado = data.map((item) => ({
        fechaOriginal: item.fecha,
        fecha: new Date(item.fecha).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
        }),
        total: Number(item.total || 0),
        ventas: Number(item.ventas || item.total_ventas || 0),
      }));

      setVentasDia(formateado);
    } catch (error) {
      console.log(error);
    }
  };

  const cargarTopProductos = async (inicio = "", fin = "") => {
    try {
      const data = await getTopProductos(inicio, fin);
      setTopProductos(data);
    } catch (error) {
      console.log(error);
    }
  };

  const formatoFechaInput = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatearFechaBonita = (fecha) => {
    if (!fecha) return "";
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatoDinero = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const obtenerRangoTexto = () => {
    if (fechaInicio && fechaFin) {
      return `${formatearFechaBonita(fechaInicio)} al ${formatearFechaBonita(fechaFin)}`;
    }

    if (fechaInicio) return `Desde ${formatearFechaBonita(fechaInicio)}`;
    if (fechaFin) return `Hasta ${formatearFechaBonita(fechaFin)}`;

    return "Reporte general";
  };

  const aplicarFiltro = () => {
    cargarTodo(fechaInicio, fechaFin);
  };

  const filtrarHoy = () => {
    const hoy = formatoFechaInput(new Date());
    setFechaInicio(hoy);
    setFechaFin(hoy);
    cargarTodo(hoy, hoy);
  };

  const filtrarSemana = () => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - 6);

    const inicioTexto = formatoFechaInput(inicio);
    const finTexto = formatoFechaInput(hoy);

    setFechaInicio(inicioTexto);
    setFechaFin(finTexto);
    cargarTodo(inicioTexto, finTexto);
  };

  const filtrarMes = () => {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const inicioTexto = formatoFechaInput(inicio);
    const finTexto = formatoFechaInput(hoy);

    setFechaInicio(inicioTexto);
    setFechaFin(finTexto);
    cargarTodo(inicioTexto, finTexto);
  };

  const limpiarFiltro = () => {
    setFechaInicio("");
    setFechaFin("");
    cargarTodo();
  };

  const agregarPiePagina = (doc) => {
    const totalPaginas = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setDrawColor(217, 90, 142);
      doc.line(14, pageHeight - 22, pageWidth - 14, pageHeight - 22);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Reporte generado automáticamente por Rosmeli POS", pageWidth / 2, pageHeight - 15, {
        align: "center",
      });
      doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - 14, pageHeight - 10, {
        align: "right",
      });
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const rango = obtenerRangoTexto();
    const ingresosHoy = Number(datos?.ventas_hoy?.ingresos || 0);
    const ingresosTotales = Number(datos?.ventas_totales?.ingresos || 0);
    const ventasHoy = Number(datos?.ventas_hoy?.total_ventas || 0);
    const ventasTotales = Number(datos?.ventas_totales?.total_ventas || 0);
    const productosVendidos = Number(datos?.productos_vendidos || 0);
    const productoEstrella = topProductos[0];

    // ENCABEZADO PREMIUM
    doc.setFillColor(217, 90, 142);
    doc.rect(0, 0, pageWidth, 45, "F");

    try {
      doc.addImage(logo, "PNG", 14, 8, 35, 25);
    } catch (error) {
      console.log("No se pudo cargar el logo en el PDF", error);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ROSMELI POS", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte avanzado de ventas", pageWidth / 2, 27, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Periodo: ${rango}`, pageWidth / 2, 35, { align: "center" });

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleString("es-MX")}`, 14, 55);

    // TARJETAS KPI
    const kpis = [
      {
        titulo: "Ingresos hoy",
        valor: formatoDinero(ingresosHoy),
      },
      {
        titulo: "Ventas hoy",
        valor: ventasHoy,
      },
      {
        titulo: "Ingresos acumulados",
        valor: formatoDinero(ingresosTotales),
      },
      {
        titulo: "Productos vendidos",
        valor: productosVendidos,
      },
    ];

    const cardY = 63;
    const cardW = 43;
    const cardH = 24;
    const gap = 5;
    const startX = 14;

    kpis.forEach((kpi, index) => {
      const x = startX + index * (cardW + gap);
      doc.setFillColor(255, 247, 250);
      doc.roundedRect(x, cardY, cardW, cardH, 4, 4, "F");
      doc.setDrawColor(245, 190, 213);
      doc.roundedRect(x, cardY, cardW, cardH, 4, 4, "S");
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(kpi.titulo, x + 4, cardY + 8);
      doc.setTextColor(207, 95, 141);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(String(kpi.valor), x + 4, cardY + 18);
    });

    // RESUMEN EJECUTIVO
    autoTable(doc, {
      startY: 97,
      head: [["Resumen ejecutivo", "Resultado"]],
      body: [
        ["Periodo analizado", rango],
        ["Ventas realizadas hoy", ventasHoy],
        ["Ingresos del día", formatoDinero(ingresosHoy)],
        ["Ventas acumuladas", ventasTotales],
        ["Ingresos acumulados", formatoDinero(ingresosTotales)],
        ["Productos vendidos", productosVendidos],
        ["Producto más vendido", productoEstrella?.nombre || "Sin datos"],
      ],
      headStyles: {
        fillColor: [207, 95, 141],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [255, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // VENTAS POR DÍA
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Fecha", "Ventas", "Total vendido"]],
      body:
        ventasDia.length > 0
          ? ventasDia.map((item) => [
              item.fecha,
              item.ventas || "-",
              formatoDinero(item.total),
            ])
          : [["Sin datos", "0", formatoDinero(0)]],
      headStyles: {
        fillColor: [217, 90, 142],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: { fillColor: [255, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // TOP PRODUCTOS
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Lugar", "Producto", "Cantidad vendida"]],
      body:
        topProductos.length > 0
          ? topProductos.slice(0, 10).map((producto, index) => [
              index === 0
                ? "1"
                : index === 1
                  ? "2"
                  : index === 2
                    ? "3"
                    : index + 1,
              producto.nombre,
              producto.vendidos,
            ])
          : [["-", "Sin productos vendidos", "0"]],
      headStyles: {
        fillColor: [207, 95, 141],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: { fillColor: [255, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // CONCLUSIÓN AUTOMÁTICA
    let conclusion = "No hay datos suficientes para generar una conclusión del periodo seleccionado.";

    if (productoEstrella) {
      conclusion = `Durante este periodo, el producto con mejor rendimiento fue ${productoEstrella.nombre}, con ${productoEstrella.vendidos} unidades vendidas. Se recomienda mantener suficiente inventario de este producto y revisar constantemente su disponibilidad para evitar pérdida de ventas.`;
    }

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["Conclusión automática"]],
      body: [[conclusion]],
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
      },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    agregarPiePagina(doc);
    doc.save("Reporte_Avanzado_Rosmeli_POS.pdf");
  };

  const cards = [
    {
      titulo: "Ventas de Hoy",
      valor: datos?.ventas_hoy?.total_ventas || 0,
      icono: <PointOfSaleIcon />,
      color: "#d95a8e",
      fondo: "#fde8f0",
    },
    {
      titulo: "Ingresos Hoy",
      valor: formatoDinero(datos?.ventas_hoy?.ingresos || 0),
      icono: <AttachMoneyIcon />,
      color: "#2e7d32",
      fondo: "#e8f5e9",
    },
    {
      titulo: "Ventas Totales",
      valor: datos?.ventas_totales?.total_ventas || 0,
      icono: <AttachMoneyIcon />,
      color: "#1976d2",
      fondo: "#e3f2fd",
    },
    {
      titulo: "Productos Vendidos",
      valor: datos?.productos_vendidos || 0,
      icono: <ShoppingBagIcon />,
      color: "#ed6c02",
      fondo: "#fff3e0",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff7fa" }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          p: { xs: 2, md: 4 },
          pt: { xs: 10, md: 4 },
          ml: { xs: 0, md: 3 },
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              fontWeight={900}
              color="#cf5f8d"
              sx={{ fontSize: { xs: 32, md: 40 }, lineHeight: 1.1 }}
            >
              Reportes
            </Typography>

            <Typography color="#777" sx={{ fontSize: { xs: 14, md: 16 } }}>
              Estadísticas generales del negocio
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={generarPDF}
            disabled={cargando}
            sx={{
              bgcolor: "#d95a8e",
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: 900,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                bgcolor: "#cf4f82",
              },
            }}
          >
            Generar PDF avanzado
          </Button>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2, md: 3 },
            mb: 4,
            boxShadow: "0 12px 30px rgba(177,112,139,0.14)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <Box sx={{ width: { xs: "100%", sm: 220 } }}>
              <Typography fontSize={13} fontWeight={800} color="#777" mb={0.5}>
                Fecha Inicio
              </Typography>

              <TextField
                type="date"
                size="small"
                fullWidth
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </Box>

            <Box sx={{ width: { xs: "100%", sm: 220 } }}>
              <Typography fontSize={13} fontWeight={800} color="#777" mb={0.5}>
                Fecha Fin
              </Typography>

              <TextField
                type="date"
                size="small"
                fullWidth
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </Box>

            <Button
              variant="contained"
              onClick={aplicarFiltro}
              disabled={cargando}
              sx={{
                height: 40,
                bgcolor: "#cf5f8d",
                fontWeight: 900,
                textTransform: "none",
                px: 3,
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  bgcolor: "#b64d78",
                },
              }}
            >
              Filtrar
            </Button>

            <Button variant="outlined" startIcon={<TodayIcon />} onClick={filtrarHoy} sx={botonFiltroRapido}>
              Hoy
            </Button>

            <Button variant="outlined" startIcon={<DateRangeIcon />} onClick={filtrarSemana} sx={botonFiltroRapido}>
              Semana
            </Button>

            <Button variant="outlined" startIcon={<DateRangeIcon />} onClick={filtrarMes} sx={botonFiltroRapido}>
              Mes
            </Button>

            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={limpiarFiltro} sx={botonFiltroRapido}>
              Limpiar
            </Button>
          </Box>
        </Card>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {cards.map((card, index) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  minHeight: { xs: 135, md: 220 },
                  height: "100%",
                  boxShadow: "0 14px 35px rgba(177,112,139,0.16)",
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, md: 3 } }}>
                  <Box
                    sx={{
                      width: { xs: 46, md: 64 },
                      height: { xs: 46, md: 64 },
                      borderRadius: { xs: 3, md: 4 },
                      bgcolor: card.fondo,
                      color: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: { xs: 1.5, md: 2.5 },
                      "& svg": {
                        fontSize: { xs: 28, md: 42 },
                      },
                    }}
                  >
                    {card.icono}
                  </Box>

                  <Typography color="#777" fontSize={{ xs: 12, md: 13 }}>
                    {card.titulo}
                  </Typography>

                  <Typography
                    fontWeight={900}
                    fontSize={{ xs: 22, md: 42 }}
                    color={card.color}
                    sx={{ wordBreak: "break-word" }}
                  >
                    {card.valor}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: 4,
            p: { xs: 2, md: 3 },
            boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
          }}
        >
          <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={2}>
            Resumen General
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <Box sx={resumenItem}>
              <Typography color="#777" fontSize={13}>
                Ingresos acumulados
              </Typography>
              <Typography fontWeight={900} fontSize={24} color="#2e7d32">
                {formatoDinero(datos?.ventas_totales?.ingresos || 0)}
              </Typography>
            </Box>

            <Box sx={resumenItem}>
              <Typography color="#777" fontSize={13}>
                Ventas realizadas
              </Typography>
              <Typography fontWeight={900} fontSize={24} color="#1976d2">
                {datos?.ventas_totales?.total_ventas || 0}
              </Typography>
            </Box>

            <Box sx={resumenItem}>
              <Typography color="#777" fontSize={13}>
                Producto más vendido
              </Typography>
              <Typography fontWeight={900} fontSize={24} color="#ed6c02">
                {topProductos[0]?.nombre || "Sin datos"}
              </Typography>
            </Box>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: 4,
            p: { xs: 2, md: 3 },
            boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
          }}
        >
          <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={3}>
            📈 Ventas por día
          </Typography>

          <Box sx={{ width: "100%", height: { xs: 260, md: 400 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventasDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatoDinero(value)} />
                <Line type="monotone" dataKey="total" stroke="#d95a8e" strokeWidth={4} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: 4,
            p: { xs: 2, md: 3 },
            boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
          }}
        >
          <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={3}>
            🏆 Productos más vendidos
          </Typography>

          {topProductos.length > 0 ? (
            topProductos.map((producto, index) => (
              <Box
                key={`${producto.nombre}-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: { xs: 1.5, md: 2 },
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "#fff7fa",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography fontSize={{ xs: 24, md: 28 }}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"}
                  </Typography>

                  <Box>
                    <Typography fontWeight={900}>{producto.nombre}</Typography>
                    <Typography color="#777" fontSize={13}>
                      Producto destacado
                    </Typography>
                  </Box>
                </Box>

                <Typography fontWeight={900} color="#cf5f8d" fontSize={{ xs: 20, md: 24 }}>
                  {producto.vendidos}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="#777">No hay productos vendidos en este rango.</Typography>
          )}
        </Card>
      </Box>
    </Box>
  );
}

const botonFiltroRapido = {
  height: 40,
  borderColor: "#d95a8e",
  color: "#d95a8e",
  fontWeight: 800,
  textTransform: "none",
  borderRadius: 3,
  width: { xs: "100%", sm: "auto" },
  "&:hover": {
    borderColor: "#cf4f82",
    bgcolor: "#fff7fa",
  },
};

const resumenItem = {
  p: 2,
  borderRadius: 3,
  bgcolor: "#fff7fa",
};

export default Reportes;
