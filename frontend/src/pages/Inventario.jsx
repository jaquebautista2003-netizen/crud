import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getResumenInventario } from "../services/inventario.service";

function Inventario() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      const data = await getResumenInventario();
      setDatos(data);
    } catch (error) {
      console.log(error);
      alert("Error al cargar inventario");
    }
  };

  const resumen = datos?.resumen || {};

  const cards = [
    {
      titulo: "Total productos",
      valor: resumen.total_productos || 0,
      icono: <Inventory2Icon />,
      color: "#cf5f8d",
      fondo: "#fde8f0",
    },
    {
      titulo: "Stock total",
      valor: resumen.stock_total || 0,
      icono: <Inventory2Icon />,
      color: "#1976d2",
      fondo: "#e3f2fd",
    },
    {
      titulo: "Disponibles",
      valor: resumen.disponibles || 0,
      icono: <CheckCircleIcon />,
      color: "#2e7d32",
      fondo: "#e8f5e9",
    },
    {
      titulo: "Stock bajo",
      valor: resumen.stock_bajo || 0,
      icono: <WarningAmberIcon />,
      color: "#ed6c02",
      fondo: "#fff3e0",
    },
    {
      titulo: "Agotados",
      valor: resumen.agotados || 0,
      icono: <CancelIcon />,
      color: "#d32f2f",
      fondo: "#ffebee",
    },
  ];

  const obtenerImagen = (imagen) => {
    if (!imagen) return null;
    if (imagen.startsWith("http")) return imagen;
    return `http://localhost:3000${imagen}`;
  };

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
        }}
      >
        <Typography fontWeight={900} color="#cf5f8d" sx={{ fontSize: 48 }}>
          Inventario
        </Typography>

        <Typography color="#777" mb={4}>
          Control inteligente de existencias, stock bajo y productos agotados
        </Typography>

        {Number(resumen.agotados || 0) > 0 && (
          <Card
            elevation={0}
            sx={{
              mb: 4,
              p: 2.5,
              borderRadius: 4,
              bgcolor: "#ffebee",
              color: "#d32f2f",
              boxShadow: "0 12px 30px rgba(211,47,47,0.12)",
            }}
          >
            <Typography fontWeight={900} fontSize={20}>
              🚨 Atención
            </Typography>

            <Typography>
              Hay {resumen.agotados} producto(s) agotado(s). Revisa el inventario.
            </Typography>
          </Card>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {cards.map((card, index) => (
            <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2.4 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  minHeight: {
                    xs: 130,
                    md: 180,
                  },
                  height: "100%",
                  boxShadow: "0 14px 35px rgba(177,112,139,0.16)",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: { xs: 42, md: 58 },
                      height: { xs: 42, md: 58 },
                      borderRadius: 4,
                      bgcolor: card.fondo,
                      color: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      "& svg": {
                        fontSize: { xs: 28, md: 38 },
                      },
                    }}
                  >
                    {card.icono}
                  </Box>

                  <Typography color="#777" fontSize={13}>
                    {card.titulo}
                  </Typography>

                  <Typography
                    fontWeight={900}
                    fontSize={{ xs: 24, md: 34 }}
                    color={card.color}
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
            borderRadius: 4,
            p: 3,
            mb: 4,
            boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
          }}
        >
          <Typography fontWeight={900} color="#ed6c02" fontSize={22} mb={2}>
            ⚠ Productos con stock bajo
          </Typography>

          {datos?.productos_stock_bajo?.length > 0 ? (
            datos.productos_stock_bajo.map((producto) => (
              <Box
                key={producto.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "#fff3e0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {producto.imagen ? (
                    <Box
                      component="img"
                      src={obtenerImagen(producto.imagen)}
                      alt={producto.nombre}
                      sx={{
                        width: 55,
                        height: 55,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 55,
                        height: 55,
                        borderRadius: 2,
                        bgcolor: "#fde8f0",
                      }}
                    />
                  )}

                  <Box>
                    <Typography fontWeight={900}>{producto.nombre}</Typography>
                    <Typography color="#777" fontSize={14}>
                      Stock bajo
                    </Typography>
                  </Box>
                </Box>

                <Typography fontWeight={900} color="#ed6c02" fontSize={24}>
                  {producto.stock}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="#777">
              No hay productos con stock bajo.
            </Typography>
          )}
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 3,
            boxShadow: "0 12px 30px rgba(177,112,139,0.16)",
          }}
        >
          <Typography fontWeight={900} color="#d32f2f" fontSize={22} mb={2}>
            ❌ Productos agotados
          </Typography>

          {datos?.productos_agotados?.length > 0 ? (
            datos.productos_agotados.map((producto) => (
              <Box
                key={producto.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "#ffebee",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {producto.imagen ? (
                    <Box
                      component="img"
                      src={obtenerImagen(producto.imagen)}
                      alt={producto.nombre}
                      sx={{
                        width: 55,
                        height: 55,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 55,
                        height: 55,
                        borderRadius: 2,
                        bgcolor: "#fde8f0",
                      }}
                    />
                  )}

                  <Box>
                    <Typography fontWeight={900}>{producto.nombre}</Typography>
                    <Typography color="#777" fontSize={14}>
                      Producto agotado
                    </Typography>
                  </Box>
                </Box>

                <Typography fontWeight={900} color="#d32f2f" fontSize={24}>
                  {producto.stock}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="#777">
              No hay productos agotados.
            </Typography>
          )}
        </Card>
      </Box>
    </Box>
  );
}

export default Inventario;