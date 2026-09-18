import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { esAdmin } from "../utils/auth";
import logo from "../assets/Logo.png";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const drawerWidth = 260;

function Sidebar() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:900px)");
  const [open, setOpen] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const menu = [
    { texto: "Dashboard", icono: <DashboardIcon />, ruta: "/dashboard" },
    { texto: "Productos", icono: <ShoppingBagIcon />, ruta: "/productos" },
    { texto: "Inventario", icono: <Inventory2Icon />, ruta: "/inventario" },
    { texto: "Caja", icono: <PointOfSaleIcon />, ruta: "/caja" },
    { texto: "Ventas", icono: <ReceiptLongIcon />, ruta: "/ventas", admin: true },
    { texto: "Reportes", icono: <BarChartIcon />, ruta: "/reportes", admin: true },
    { texto: "Usuarios", icono: <PeopleIcon />, ruta: "/usuarios", admin: true },
  ].filter((item) => !item.admin || esAdmin());

  const navegar = (ruta) => {
    navigate(ruta);
    setOpen(false);
  };

  const contenido = (
    <Box sx={{ width: drawerWidth, minHeight: "100vh", bgcolor: "#fff", p: 2 }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Box
          component="img"
          src={logo}
          alt="Rosmeli"
          sx={{
            width: "100%",
            height: 90,
            objectFit: "cover",
            borderRadius: 3,
          }}
        />

        <Typography fontWeight={900} color="#cf5f8d" mt={1} fontSize={18}>
          Rosmeli POS
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List>
        {menu.map((item) => (
          <ListItemButton
            key={item.texto}
            onClick={() => navegar(item.ruta)}
            sx={{
              borderRadius: 3,
              mb: 1,
              color: "#555",
              "&:hover": {
                bgcolor: "#fde8f0",
                color: "#cf5f8d",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
              {item.icono}
            </ListItemIcon>
            <ListItemText primary={item.texto} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <ListItemButton
        onClick={cerrarSesion}
        sx={{
          borderRadius: 3,
          color: "#cf5f8d",
          "&:hover": {
            bgcolor: "#fde8f0",
          },
        }}
      >
        <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Cerrar sesión" />
      </ListItemButton>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "#ffffff",
            color: "#cf5f8d",
            boxShadow: "0 6px 20px rgba(177,112,139,0.15)",
          }}
        >
          <Toolbar>
            <IconButton onClick={() => setOpen(true)} sx={{ color: "#cf5f8d" }}>
              <MenuIcon />
            </IconButton>

            <Typography fontWeight={900} ml={1}>
              Rosmeli POS
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {isMobile ? (
        <Drawer open={open} onClose={() => setOpen(false)}>
          {contenido}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            minHeight: "100vh",
            bgcolor: "#fff",
            boxShadow: "8px 0 30px rgba(177,112,139,0.14)",
          }}
        >
          {contenido}
        </Box>
      )}
    </>
  );
}

export default Sidebar;