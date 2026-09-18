import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import BarChartIcon from "@mui/icons-material/BarChart";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getResumenReportes,
    getVentasPorDia,
    getTopProductos,
} from "../services/reportes.service";
import { getResumenInventario } from "../services/inventario.service";
import { esAdmin } from "../utils/auth";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

function Dashboard() {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const [reportes, setReportes] = useState(null);
    const [inventario, setInventario] = useState(null);
    const [ventasDia, setVentasDia] = useState([]);
    const [topProductos, setTopProductos] = useState([]);

    const META_DIARIA = 2000;

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            const [dataReportes, dataInventario, dataVentasDia, dataTopProductos] = await Promise.all([
                getResumenReportes(),
                getResumenInventario(),
                getVentasPorDia(),
                getTopProductos(),
            ]);

            const ventasFormateadas = dataVentasDia.map((item) => ({
                fecha: new Date(item.fecha).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                }),
                total: Number(item.total || 0),
            }));

            setReportes(dataReportes);
            setInventario(dataInventario);
            setVentasDia(ventasFormateadas);
            setTopProductos(dataTopProductos || []);
        } catch (error) {
            console.log(error);
        }
    };

    const formatoDinero = (valor) => {
        return `$${Number(valor || 0).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const resumenInv = inventario?.resumen || {};
    const ingresosHoy = Number(reportes?.ventas_hoy?.ingresos || 0);
    const avanceMeta = Math.min((ingresosHoy / META_DIARIA) * 100, 100);

    const obtenerSaludNegocio = () => {
        if (Number(resumenInv.agotados || 0) > 0) {
            return {
                texto: "Crítica",
                emoji: "🔴",
                color: "#d32f2f",
                fondo: "#ffebee",
                mensaje: "Hay productos agotados. Revisa inventario para evitar perder ventas.",
            };
        }

        if (Number(resumenInv.stock_bajo || 0) >= 5) {
            return {
                texto: "Regular",
                emoji: "🟡",
                color: "#ed6c02",
                fondo: "#fff3e0",
                mensaje: "Varios productos están en stock bajo. Conviene surtir pronto.",
            };
        }

        return {
            texto: "Excelente",
            emoji: "🟢",
            color: "#2e7d32",
            fondo: "#e8f5e9",
            mensaje: "El negocio se mantiene estable y sin alertas graves de inventario.",
        };
    };

    const salud = obtenerSaludNegocio();
    const productoEstrella = topProductos[0];

    const cards = [
        {
            titulo: "Ventas de hoy",
            valor: formatoDinero(ingresosHoy),
            icono: <AttachMoneyIcon />,
            color: "#2e7d32",
            fondo: "#e8f5e9",
        },
        {
            titulo: "Ventas realizadas",
            valor: reportes?.ventas_hoy?.total_ventas || 0,
            icono: <PointOfSaleIcon />,
            color: "#d95a8e",
            fondo: "#fde8f0",
        },
        {
            titulo: "Stock total",
            valor: resumenInv.stock_total || 0,
            icono: <Inventory2Icon />,
            color: "#1976d2",
            fondo: "#e3f2fd",
        },
        {
            titulo: "Productos vendidos",
            valor: reportes?.productos_vendidos || 0,
            icono: <ShoppingBagIcon />,
            color: "#ed6c02",
            fondo: "#fff3e0",
        },
        {
            titulo: "Stock bajo",
            valor: resumenInv.stock_bajo || 0,
            icono: <WarningAmberIcon />,
            color: "#d32f2f",
            fondo: "#ffebee",
        },
        {
            titulo: "Agotados",
            valor: resumenInv.agotados || 0,
            icono: <Inventory2Icon />,
            color: "#7b1fa2",
            fondo: "#f3e5f5",
        },
        {
            titulo: "Usuarios",
            valor: "1",
            icono: <PeopleIcon />,
            color: "#cf5f8d",
            fondo: "#fde8f0",
        },
        {
            titulo: "Salud negocio",
            valor: salud.texto,
            icono: <HealthAndSafetyIcon />,
            color: salud.color,
            fondo: salud.fondo,
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
                <Typography
                    fontWeight={900}
                    color="#cf5f8d"
                    sx={{ fontSize: { xs: 32, md: 40 }, lineHeight: 1.1 }}
                    mb={1}
                >
                    Dashboard inteligente
                </Typography>

                <Typography color="#777">
                    Bienvenida, {usuario?.nombre || "Usuario"} 👋
                </Typography>

                <Typography color="#999" mb={4}>
                    {new Date().toLocaleDateString("es-MX", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </Typography>

                {(Number(resumenInv.agotados || 0) > 0 || Number(resumenInv.stock_bajo || 0) > 0) && (
                    <Card
                        elevation={0}
                        sx={{
                            mb: 4,
                            p: { xs: 2, md: 2.5 },
                            borderRadius: 4,
                            bgcolor: "#ffebee",
                            color: "#d32f2f",
                            boxShadow: "0 12px 30px rgba(211,47,47,0.12)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <WarningAmberIcon sx={{ fontSize: { xs: 32, md: 38 } }} />

                            <Box>
                                <Typography fontWeight={900} fontSize={{ xs: 18, md: 20 }}>
                                    Inventario requiere atención
                                </Typography>

                                <Typography fontSize={{ xs: 14, md: 16 }}>
                                    {resumenInv.agotados || 0} producto(s) agotado(s) y {" "}
                                    {resumenInv.stock_bajo || 0} producto(s) con stock bajo.
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                )}

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {cards.map((card, index) => (
                        <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 4,
                                    minHeight: { xs: 128, md: 190 },
                                    height: "100%",
                                    boxShadow: "0 14px 35px rgba(177,112,139,0.16)",
                                }}
                            >
                                <CardContent sx={{ p: { xs: 1.5, md: 3 } }}>
                                    <Box
                                        sx={{
                                            width: { xs: 42, md: 60 },
                                            height: { xs: 42, md: 60 },
                                            borderRadius: { xs: 3, md: 4 },
                                            bgcolor: card.fondo,
                                            color: card.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: { xs: 1.5, md: 2 },
                                            "& svg": {
                                                fontSize: { xs: 24, md: 34 },
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
                                        fontSize={{ xs: 22, md: 34 }}
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

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 2, md: 3 },
                                height: "100%",
                                boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                            }}
                        >
                            <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={2}>
                                🧠 Salud del negocio
                            </Typography>

                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: salud.fondo,
                                    color: salud.color,
                                    mb: 2,
                                }}
                            >
                                <Typography fontWeight={900} fontSize={24}>
                                    {salud.emoji} {salud.texto}
                                </Typography>
                                <Typography fontSize={14}>{salud.mensaje}</Typography>
                            </Box>

                            <Typography mb={1}>
                                💰 Ingresos hoy: <strong>{formatoDinero(ingresosHoy)}</strong>
                            </Typography>

                            <Typography mb={1}>
                                🧾 Ventas hoy: <strong>{reportes?.ventas_hoy?.total_ventas || 0}</strong>
                            </Typography>

                            <Typography mb={1}>
                                📦 Productos registrados: <strong>{resumenInv.total_productos || 0}</strong>
                            </Typography>

                            <Typography>
                                ❌ Productos agotados: <strong>{resumenInv.agotados || 0}</strong>
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 2, md: 3 },
                                height: "100%",
                                boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                            }}
                        >
                            <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={2}>
                                🎯 Meta diaria
                            </Typography>

                            <Typography color="#777" mb={1}>
                                Meta: <strong>{formatoDinero(META_DIARIA)}</strong>
                            </Typography>

                            <Typography fontWeight={900} fontSize={{ xs: 30, md: 38 }} color="#2e7d32">
                                {formatoDinero(ingresosHoy)}
                            </Typography>

                            <LinearProgress
                                variant="determinate"
                                value={avanceMeta}
                                sx={{
                                    height: 14,
                                    borderRadius: 10,
                                    mt: 2,
                                    mb: 1,
                                    bgcolor: "#f8d7e4",
                                    "& .MuiLinearProgress-bar": {
                                        bgcolor: "#d95a8e",
                                    },
                                }}
                            />

                            <Typography color="#777" fontSize={14}>
                                Avance: {avanceMeta.toFixed(0)}%
                            </Typography>

                            <Typography
                                color={avanceMeta >= 100 ? "#2e7d32" : "#777"}
                                fontWeight={800}
                            >
                                {avanceMeta >= 100
                                    ? "Meta alcanzada ✅"
                                    : `Faltan $${Number(META_DIARIA - ingresosHoy).toLocaleString()} para alcanzar la meta`}
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 2, md: 3 },
                                height: "100%",
                                boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                            }}
                        >
                            <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={3}>
                                <TrendingUpIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                                Ventas recientes
                            </Typography>

                            <Box sx={{ width: "100%", height: { xs: 260, md: 330 } }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={ventasDia}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value) => formatoDinero(value)} />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#d95a8e"
                                            strokeWidth={4}
                                            dot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 5 }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 2, md: 3 },
                                height: "100%",
                                boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                            }}
                        >
                            <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={3}>
                                🏆 Ranking de productos
                            </Typography>

                            {topProductos.length > 0 ? (
                                topProductos.slice(0, 5).map((producto, index) => (
                                    <Box
                                        key={`${producto.nombre}-${index}`}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            p: 1.5,
                                            mb: 1.5,
                                            borderRadius: 3,
                                            bgcolor: "#fff7fa",
                                            gap: 2,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Typography fontSize={24}>
                                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"}
                                            </Typography>
                                            <Box>
                                                <Typography fontWeight={900}>{producto.nombre}</Typography>
                                                <Typography color="#777" fontSize={13}>
                                                    Producto destacado
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography fontWeight={900} color="#cf5f8d" fontSize={20}>
                                            {producto.vendidos}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="#777">Todavía no hay productos vendidos.</Typography>
                            )}

                            {productoEstrella && (
                                <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: "#fde8f0" }}>
                                    <Typography fontWeight={900} color="#cf5f8d">
                                        Producto estrella
                                    </Typography>
                                    <Typography color="#777" fontSize={14}>
                                        {productoEstrella.nombre} lidera con {productoEstrella.vendidos} unidades vendidas.
                                    </Typography>
                                </Box>
                            )}
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 2, md: 3 },
                                height: "100%",
                                boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                            }}
                        >
                            <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={2}>
                                Alertas inteligentes
                            </Typography>

                            <Typography mb={1} color="#777">
                                {Number(resumenInv.stock_bajo || 0) > 0
                                    ? `⚠ Hay ${resumenInv.stock_bajo} producto(s) con stock bajo.`
                                    : "✅ No hay productos con stock bajo."}
                            </Typography>

                            <Typography mb={1} color="#777">
                                {Number(resumenInv.agotados || 0) > 0
                                    ? `❌ Hay ${resumenInv.agotados} producto(s) agotado(s).`
                                    : "✅ No hay productos agotados."}
                            </Typography>

                            <Typography color="#777">
                                {productoEstrella
                                    ? `🌟 ${productoEstrella.nombre} es el producto más vendido del periodo.`
                                    : "📊 Aún no hay suficiente información para detectar el producto estrella."}
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                p: { xs: 2, md: 3 },
                                height: "100%",
                                boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
                            }}
                        >
                            <Typography fontWeight={900} color="#cf5f8d" fontSize={22} mb={2}>
                                Acciones rápidas
                            </Typography>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                    gap: 2,
                                }}
                            >
                                {esAdmin() && (
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => navigate("/productos")}
                                        sx={botonAccion}
                                    >
                                        Nuevo producto
                                    </Button>
                                )}

                                <Button
                                    variant="contained"
                                    startIcon={<PointOfSaleIcon />}
                                    onClick={() => navigate("/caja")}
                                    sx={botonAccion}
                                >
                                    Nueva venta
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<Inventory2Icon />}
                                    onClick={() => navigate("/inventario")}
                                    sx={botonAccion}
                                >
                                    Inventario
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<BarChartIcon />}
                                    onClick={() => navigate("/reportes")}
                                    sx={botonAccion}
                                >
                                    Reportes
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

const botonAccion = {
    bgcolor: "#d95a8e",
    borderRadius: 3,
    py: 1.2,
    fontWeight: 800,
    textTransform: "none",
    "&:hover": {
        bgcolor: "#cf4f82",
    },
};

export default Dashboard;
